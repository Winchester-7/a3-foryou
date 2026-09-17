/**
 * Media helpers.
 *
 * Lifestyle / editorial imagery uses picsum.photos with a deterministic seed so
 * SSR and client render identically. To switch to your own CDN or Unsplash,
 * change `photoUrl` here and add the hostname to `next.config.mjs`.
 */

export function photoUrl(seed: string, width: number, height: number, opts?: { grayscale?: boolean; blur?: number }): string {
  const clean = encodeURIComponent(seed.replace(/[^a-zA-Z0-9-_]/g, '-'));
  const params: string[] = [];
  if (opts?.grayscale) params.push('grayscale');
  if (opts?.blur) params.push(`blur=${opts.blur}`);
  const q = params.length ? `?${params.join('&')}` : '';
  return `https://picsum.photos/seed/${clean}/${width}/${height}${q}`;
}

/** Tiny inline SVG used as a blur placeholder for next/image. */
export function blurData(hex = '#EFEDE9'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${hex}"/></svg>`;
  const base64 = typeof window === 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

/** Stable numeric seed from a string (used for procedural tile textures). */
export function numericSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000;
}
