'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { backdrop, drawerIn, drawerOut } from '@/lib/motion';
import type { Collection, Facets } from '@/lib/types';
import { brandName, getLook } from '@/lib/catalog';
import { CollectionCard } from './CollectionCard';
import { Filters, type FilterKey, type FilterState } from './Filters';

const SORTS = [
  { id: 'featured', label: 'По умолчанию' },
  { id: 'name', label: 'По названию' },
  { id: 'decors', label: 'Больше декоров' },
];

const empty: FilterState = { looks: [], brands: [], sizes: [], surfaces: [], applications: [] };

export function CatalogView({ collections, facets }: { collections: Collection[]; facets: Facets }) {
  const [filters, setFilters] = useState<FilterState>(empty);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [drawer, setDrawer] = useState(false);

  const toggle = (key: FilterKey, value: string) =>
    setFilters((s) => ({
      ...s,
      [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value],
    }));
  const reset = () => {
    setFilters(empty);
    setQuery('');
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = collections.filter((c) => {
      if (term && !`${c.nameRu} ${c.name} ${c.tagline}`.toLowerCase().includes(term)) return false;
      if (filters.looks.length && !filters.looks.includes(getLook(c.look)?.short ?? c.look)) return false;
      if (filters.brands.length && !filters.brands.includes(brandName(c.brand))) return false;
      if (filters.sizes.length && !filters.sizes.some((s) => c.sizes.includes(s))) return false;
      if (filters.surfaces.length && !filters.surfaces.some((s) => c.surfaces.includes(s))) return false;
      if (filters.applications.length && !filters.applications.some((a) => c.applications.includes(a))) return false;
      return true;
    });
    list = [...list];
    if (sort === 'name') list.sort((a, b) => a.nameRu.localeCompare(b.nameRu, 'ru'));
    else if (sort === 'decors') list.sort((a, b) => b.products.length - a.products.length);
    return list;
  }, [collections, filters, query, sort]);

  return (
    <div className="container-x py-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[260px_1fr] xl:gap-14">
        <aside className="hidden lg:block">
          <Filters facets={facets} state={filters} onToggle={toggle} onReset={reset} resultCount={filtered.length} />
        </aside>

        <div>
          <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <svg width="16" height="16" viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden>
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по коллекции"
                className="w-full rounded-full border border-line bg-surface/60 py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-accent focus:bg-paper"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="rounded-full border border-line px-4 py-2.5 text-xs uppercase tracking-wide2 text-ink lg:hidden"
              >
                Фильтры
              </button>
              <label className="relative">
                <span className="sr-only">Сортировка</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-full border border-line bg-paper py-2.5 pl-4 pr-9 text-xs uppercase tracking-wide2 text-ink outline-none focus:border-accent"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden>
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                </svg>
              </label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg text-ink">Ничего не найдено</p>
              <p className="mt-2 text-sm text-ink-faint">Измените параметры фильтра или сбросьте их.</p>
              <button type="button" onClick={reset} className="btn-outline mt-6">Сбросить фильтры</button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
              {filtered.map((c, i) => (
                <CollectionCard key={c.slug} collection={c} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-ink/30 lg:hidden"
              {...backdrop}
              onClick={() => setDrawer(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-[71] w-[88%] max-w-sm overflow-y-auto bg-paper p-6 lg:hidden"
              initial={{ x: '-100%' }} animate={{ x: 0, transition: drawerIn }} exit={{ x: '-100%', transition: drawerOut }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="eyebrow">Фильтры</p>
                <button type="button" aria-label="Закрыть" onClick={() => setDrawer(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface">
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" /></svg>
                </button>
              </div>
              <Filters facets={facets} state={filters} onToggle={toggle} onReset={reset} resultCount={filtered.length} />
              <button type="button" onClick={() => setDrawer(false)} className="btn-solid mt-6 w-full">
                Показать {filtered.length}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
