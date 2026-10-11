/** @author Erbol king */
import type { SVGProps } from 'react';

const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const PATHS: Record<string, string> = {
  door: 'M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16M14.5 12.5h.01',
  bath: 'M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2ZM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2',
  shower: 'M5 21V5a2 2 0 0 1 2-2h2M9 3v3M6 9h6M8 12v.01M11 12v.01M8 15v.01M11 15v.01M15 3v18M19 21H3',
  vanity: 'M4 10h16v4H4zM6 14v6h12v-6M12 10V6M10 6h4M12 16v2',
  toilet: 'M7 3h10v6H7zM5 9h14a7 7 0 0 1-7 7 7 7 0 0 1-7-7ZM9 16l-1 5h8l-1-5',
  kitchen: 'M3 11h18v10H3zM3 15h18M12 11v10M5 3h14v5H5zM8 18h1M15 18h1',
  island: 'M3 9h18v3H3zM5 12v8M19 12v8M9 12v5h6v-5',
  table: 'M3 9h18M5 9v10M19 9v10M8 5h8v4H8z',
  sofa: 'M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 18v2M19 18v2',
  bed: 'M3 7v13M21 13v7M3 16h18v-3a3 3 0 0 0-3-3H10v6M6 10.5a1.5 1.5 0 1 0 0 .01',
  wardrobe: 'M5 3h14v17H5zM12 3v17M10 11v2M14 11v2M6 20v1M18 20v1',
  tv: 'M3 4h18v11H3zM8 21h8M12 15v6',
  plant: 'M8 14h8l-1 7H9zM12 14V9M12 9c0-3 2-5 5-5 0 3-2 5-5 5ZM12 11c0-2.5-1.8-4-4.5-4 0 2.5 1.8 4 4.5 4Z',
  rug: 'M4 5h16v14H4zM7 8h10v8H7zM4 5l-1-1M20 5l1-1M4 19l-1 1M20 19l1 1',
  rotate: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  share: 'M16 6l-4-4-4 4M12 2v13M20 14v6H4v-6',
  cube: 'M12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8',
  plan: 'M3 3h18v18H3zM3 12h8M11 3v18M15 12h6',
  back: 'M15 18l-6-6 6-6',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12.5 9 17l11-11',
  whatsapp: '',
};

export function Icon({ name, ...rest }: { name: string } & SVGProps<SVGSVGElement>) {
  if (name === 'whatsapp') {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
        <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
      </svg>
    );
  }
  return (
    <svg {...base} aria-hidden {...rest}>
      <path d={PATHS[name] ?? PATHS.cube} />
    </svg>
  );
}
