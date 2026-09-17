'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TileImage } from '@/components/media/TileImage';

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);
  const list = images.length ? images : ['/catalog/lusso/hero.jpg'];

  function onMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
      <div
        ref={frameRef}
        onMouseEnter={() => !reduce && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-square overflow-hidden rounded-3xl bg-surface"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="absolute inset-0"
            style={
              zoom
                ? { transform: 'scale(1.7)', transformOrigin: `${pos.x}% ${pos.y}%`, transition: 'transform 0.2s ease-out' }
                : { transform: 'scale(1)', transition: 'transform 0.4s ease-out' }
            }
          >
            <TileImage src={list[active]} alt={name} sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </motion.div>
        </AnimatePresence>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-paper/85 px-3 py-1 text-[10px] uppercase tracking-wide2 text-ink-soft">
          Наведите для увеличения
        </span>
      </div>

      {list.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {list.slice(0, 5).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${name}, изображение ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl ring-1 transition ${
                i === active ? 'ring-accent' : 'ring-line hover:ring-ink-faint'
              }`}
            >
              <TileImage src={src} alt="" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
