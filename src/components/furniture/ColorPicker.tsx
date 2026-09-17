'use client';

import Link from 'next/link';

export type Swatch = { name: string; hex: string; href?: string; image?: string };

export function ColorPicker({
  swatches,
  activeName,
  onSelect,
  label = 'Цвет',
}: {
  swatches: Swatch[];
  activeName: string;
  onSelect?: (s: Swatch) => void;
  label?: string;
}) {
  if (swatches.length <= 1) return null;
  const active = swatches.find((s) => s.name === activeName) ?? swatches[0];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-medium uppercase tracking-wide2 text-ink">{label}</p>
        <p className="text-xs text-ink-faint">{active.name}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {swatches.map((s) => {
          const isActive = s.name === active.name;
          const cls = `relative h-9 w-9 rounded-full ring-1 transition-transform duration-200 ${
            isActive ? 'ring-accent ring-2 scale-105' : 'ring-line hover:scale-105 hover:ring-ink-faint'
          }`;
          const style = { background: s.hex } as const;
          const inner = (
            <>
              <span className="absolute inset-1 rounded-full" style={style} />
              {isActive && (
                <span className="absolute -inset-0.5 rounded-full ring-2 ring-accent" aria-hidden />
              )}
            </>
          );
          return s.href && !onSelect ? (
            <Link key={s.name} href={s.href} className={cls} aria-label={s.name} title={s.name}>
              {inner}
            </Link>
          ) : (
            <button
              key={s.name}
              type="button"
              onClick={() => onSelect?.(s)}
              className={cls}
              aria-pressed={isActive}
              aria-label={s.name}
              title={s.name}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
