'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Facets } from '@/lib/types';

export type FilterKey = 'looks' | 'brands' | 'sizes' | 'surfaces' | 'applications';
export type FilterState = Record<FilterKey, string[]>;

const GROUPS: { key: FilterKey; label: string }[] = [
  { key: 'looks', label: 'Тип поверхности' },
  { key: 'brands', label: 'Бренд' },
  { key: 'sizes', label: 'Размеры, см' },
  { key: 'surfaces', label: 'Поверхность' },
  { key: 'applications', label: 'Применение' },
];

export function Filters({
  facets,
  state,
  onToggle,
  onReset,
  resultCount,
}: {
  facets: Facets;
  state: FilterState;
  onToggle: (key: FilterKey, value: string) => void;
  onReset: () => void;
  resultCount: number;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    looks: true,
    brands: true,
    sizes: false,
    surfaces: false,
    applications: false,
  });

  const activeCount = GROUPS.reduce((n, g) => n + state[g.key].length, 0);

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm font-medium text-ink">
          Фильтры{activeCount > 0 && <span className="ml-1 text-ink-faint">({activeCount})</span>}
        </p>
        {activeCount > 0 && (
          <button type="button" onClick={onReset} className="text-xs text-accent hover:text-accent-ink">
            Сбросить
          </button>
        )}
      </div>

      <div className="divide-y divide-line border-y border-line">
        {GROUPS.map((g) => {
          const options = facets[g.key];
          if (!options.length) return null;
          const isOpen = open[g.key];
          return (
            <div key={g.key} className="py-4">
              <button
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [g.key]: !s[g.key] }))}
                className="flex w-full items-center justify-between text-left text-[13px] font-medium uppercase tracking-wide2 text-ink"
              >
                {g.label}
                <motion.svg
                  width="12" height="12" viewBox="0 0 12 12"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden
                >
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" />
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 pt-4">
                      {options.map((opt) => {
                        const selected = state[g.key].includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => onToggle(g.key, opt)}
                            aria-pressed={selected}
                            className={`rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200 ${
                              selected
                                ? 'border-accent bg-accent text-paper'
                                : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="pt-4 text-xs text-ink-faint">{resultCount} коллекций подходит под запрос</p>
    </div>
  );
}
