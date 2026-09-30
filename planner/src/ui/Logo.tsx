import { SITE_URL } from '../data/catalog';

/** Same mark as the main site; always links back to it. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href={SITE_URL} aria-label="A3 FOR YOU — на главную сайта" className="inline-flex items-center gap-2.5">
      <svg width={compact ? 32 : 38} height={compact ? 32 : 38} viewBox="0 0 40 40" fill="none">
        <path d="M2.5 33.5 L18.5 4 L24 4 L8 33.5 Z" fill="#E0241B" />
        <path d="M20 12 L32.5 33.5 L27 33.5 L17.2 16.6 Z" fill="#232323" />
        <g fill="#232323">
          <rect x="15.6" y="21" width="4.4" height="4.4" rx="0.9" />
          <rect x="21.4" y="21" width="4.4" height="4.4" rx="0.9" />
          <rect x="15.6" y="26.6" width="4.4" height="4.4" rx="0.9" />
          <rect x="21.4" y="26.6" width="4.4" height="4.4" rx="0.9" />
        </g>
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[18px] font-extrabold tracking-[-0.01em] text-ink">A3</span>
          <span className="mt-1 text-[8.5px] font-semibold uppercase tracking-brand text-ink-faint">For&nbsp;You</span>
        </span>
      )}
    </a>
  );
}
