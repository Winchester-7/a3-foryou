'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blurData } from '@/lib/media';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

export type FurnitureItem = {
  slug: string;
  name: string;
  image: string;
  tag: string;       // style (doors) or kind (sofas)
  meta: string;      // subtitle line
  colors: { hex: string }[];
};

export function FurnitureCatalog({
  items,
  basePath,
  filterLabel,
}: {
  items: FurnitureItem[];
  basePath: string;
  filterLabel: string;
}) {
  const tags = useMemo(() => Array.from(new Set(items.map((i) => i.tag))).sort((a, b) => a.localeCompare(b, 'ru')), [items]);
  const [active, setActive] = useState<string[]>([]);
  const [q, setQ] = useState('');

  const filtered = items.filter((i) => {
    if (active.length && !active.includes(i.tag)) return false;
    if (q.trim() && !i.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });

  const toggle = (t: string) => setActive((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <div className="container-x py-12 lg:py-16">
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide2 text-ink-faint">{filterLabel}:</span>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              aria-pressed={active.includes(t)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200 ${
                active.includes(t) ? 'border-accent bg-accent text-paper' : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <svg width="16" height="16" viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden>
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
            <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по модели"
            className="w-full rounded-full border border-line bg-surface/60 py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-accent focus:bg-paper"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-ink-faint">Ничего не найдено.</p>
      ) : (
        <StaggerGroup className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {filtered.map((i) => (
            <StaggerItem key={i.slug}>
              <article className="group">
                <Link href={`${basePath}/${i.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
                    <div className="absolute inset-0 transition-transform duration-[900ms] ease-premium group-hover:scale-[1.06]">
                      <Image src={i.image} alt={i.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" placeholder="blur" blurDataURL={blurData('#e8e4de')} />
                    </div>
                    <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide2 text-ink">{i.tag}</span>
                  </div>
                </Link>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <Link href={`${basePath}/${i.slug}`}>
                      <h3 className="text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">{i.name}</h3>
                    </Link>
                    <p className="mt-1 text-xs text-ink-faint">{i.meta}</p>
                  </div>
                  {i.colors.length > 0 && (
                    <div className="flex -space-x-1 pt-1">
                      {i.colors.slice(0, 4).map((c, k) => (
                        <span key={k} className="h-3.5 w-3.5 rounded-full ring-1 ring-paper" style={{ background: c.hex }} />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
