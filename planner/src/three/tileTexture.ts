import * as THREE from 'three';
import { useEffect, useState } from 'react';

import { GROUT_COLORS, type Grout, type Layout } from './tileOptions';

export interface TileSpec {
  texture: string; // swatch URL
  w: number; // tile size in metres (as laid: along surface U)
  h: number; // along surface V
  layout: Layout;
  grout: Grout;
}

export interface TilePattern {
  map: THREE.CanvasTexture;
  /** size in metres of one repeat of `map` */
  cellW: number;
  cellH: number;
}

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

// Deterministic PRNG so a pattern looks identical on every render/share.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const patterns = new Map<string, Promise<TilePattern>>();

/**
 * Builds one repeat cell of real tiles: each tile is a different crop / flip of the swatch
 * (so the floor doesn't look like one stamp repeated), separated by grout lines.
 * Planks (very elongated tiles) get random end-joint offsets like a real wood floor.
 */
export function buildPattern(spec: TileSpec): Promise<TilePattern> {
  const key = `${spec.texture}|${spec.w}|${spec.h}|${spec.layout}|${spec.grout}`;
  let p = patterns.get(key);
  if (p) return p;

  p = loadImage(spec.texture).then((img) => {
    const vertical = spec.layout === 'vertical';
    // Tile as laid on the surface (vertical = rotated 90°)
    const tw = vertical ? spec.h : spec.w;
    const th = vertical ? spec.w : spec.h;
    const plank = Math.max(tw, th) / Math.min(tw, th) > 3;

    const cols = plank ? (vertical ? 8 : 3) : tw >= 1 ? 3 : 4;
    const rows = plank ? (vertical ? 3 : 8) : th >= 1 ? 3 : 4;
    const cellW = cols * tw;
    const cellH = rows * th;

    const ppm = Math.min(2048 / cellW, 2048 / cellH, 700); // pixels per metre
    const W = Math.round(cellW * ppm);
    const H = Math.round(cellH * ppm);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = GROUT_COLORS[spec.grout];
    ctx.fillRect(0, 0, W, H);

    const rand = rng(key.length * 7919 + Math.round(spec.w * 1000) * 31 + Math.round(spec.h * 1000));
    const grout = Math.max(1.5, 0.002 * ppm); // ~2 mm joint
    const pxW = tw * ppm;
    const pxH = th * ppm;

    const drawTile = (x: number, y: number, w: number, h: number) => {
      // pick a crop of the swatch with the tile's aspect (in the swatch's own orientation)
      const aspect = vertical ? h / w : w / h;
      let sw = img.width;
      let sh = sw / aspect;
      if (sh > img.height) {
        sh = img.height;
        sw = sh * aspect;
      }
      // take a random 70–90% window so neighbouring tiles never show the same picture
      if (!plank) {
        const k = 0.7 + rand() * 0.2;
        sw *= k;
        sh *= k;
      }
      const sx = rand() * (img.width - sw);
      const sy = rand() * (img.height - sh);
      const flipX = rand() < 0.5 ? -1 : 1;
      const flipY = rand() < 0.25 ? -1 : 1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + grout / 2, y + grout / 2, w - grout, h - grout);
      ctx.clip();
      ctx.translate(x + w / 2, y + h / 2);
      if (vertical) ctx.rotate(Math.PI / 2);
      ctx.scale(flipX, plank ? 1 : flipY);
      const dw = vertical ? h : w;
      const dh = vertical ? w : h;
      ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
      // faint bevel so every tile reads as a separate piece
      ctx.strokeStyle = 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + grout / 2 + 0.5, y + grout / 2 + 0.5, w - grout - 1, h - grout - 1);
    };

    if (plank) {
      // staggered planks: each row starts at a random joint (wrap-around keeps it seamless)
      const along = vertical ? H : W;
      const across = vertical ? cols : rows;
      const len = vertical ? pxH : pxW;
      for (let r = 0; r < across; r++) {
        const shift = (0.2 + rand() * 0.6) * len;
        for (let k = -1; k * len < along + len; k++) {
          const start = k * len + shift;
          if (vertical) drawWrapped(start, r * pxW, 'y', pxW, len);
          else drawWrapped(start, r * pxH, 'x', len, pxH);
        }
      }
    } else {
      for (let r = 0; r < rows; r++) {
        const shift = spec.layout === 'offset' && r % 2 ? pxW / 2 : 0;
        for (let c = -1; c <= cols; c++) {
          const x = c * pxW + shift;
          if (x + pxW <= 0 || x >= W) continue;
          drawWrappedRect(x, r * pxH, pxW, pxH);
        }
      }
    }

    function drawWrappedRect(x: number, y: number, w: number, h: number) {
      drawTile(x, y, w, h);
      if (x < 0) drawTile(x + W, y, w, h);
      if (x + w > W) drawTile(x - W, y, w, h);
    }
    function drawWrapped(start: number, fixed: number, axis: 'x' | 'y', w: number, h: number) {
      const total = axis === 'x' ? W : H;
      const pos = ((start % total) + total) % total;
      if (axis === 'x') {
        drawTile(pos, fixed, w, h);
        if (pos + w > W) drawTile(pos - W, fixed, w, h);
      } else {
        drawTile(fixed, pos, w, h);
        if (pos + h > H) drawTile(fixed, pos - H, w, h);
      }
    }

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 8;
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    return { map, cellW, cellH };
  });
  patterns.set(key, p);
  return p;
}

/** Texture for a surface of size `u × v` metres, repeated at real tile scale. */
export function useTileTexture(spec: TileSpec, u: number, v: number): THREE.Texture | null {
  const [pattern, setPattern] = useState<TilePattern | null>(null);
  const key = `${spec.texture}|${spec.w}|${spec.h}|${spec.layout}|${spec.grout}`;

  useEffect(() => {
    let alive = true;
    buildPattern(spec).then((p) => alive && setPattern(p));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!pattern) return;
    const t = pattern.map.clone();
    t.needsUpdate = true;
    t.repeat.set(u / pattern.cellW, v / pattern.cellH);
    setTex(t);
    return () => t.dispose();
  }, [pattern, u, v]);
  return tex;
}
