'use client';

/** @author Erbol king */

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { KIND_LABEL, normalize, search, type SearchDoc } from '@/lib/search';
import { easeOut } from '@/lib/motion';
import { useSite } from './SiteProvider';

const SUGGESTIONS = ['мрамор', 'дерево', 'бетон', 'для ванной', '1200×600', 'двери', 'диваны', 'KERRANOVA', 'IDALGO'];

export function SearchOverlay({ open, onClose, index }: { open: boolean; onClose: () => void; index: SearchDoc[] }) {
  const site = useSite();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  const results = useMemo(() => search(index, q, 12), [q, index]);
  useEffect(() => setActive(0), [q]);

  const go = (r: SearchDoc) => {
    onClose();
    if (/^https?:/.test(r.href)) window.location.href = r.href;
    else router.push(r.href);
  };

  // arrows move, Enter opens; no animation here — these keys are pressed constantly
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  const typed = normalize(q).length >= 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] overflow-y-auto bg-paper/95 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <div className="container-x flex h-[var(--header-h)] items-center justify-between">
            <span className="eyebrow">Поиск</span>
            <button type="button" aria-label="Закрыть поиск" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </div>

          <div className="container-x pb-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="mx-auto max-w-3xl pt-[6vh]"
            >
              <div className="flex items-center gap-4 border-b-2 border-ink pb-4 transition-colors focus-within:border-accent">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls="search-results"
                  aria-activedescendant={results.length ? `sr-${active}` : undefined}
                  placeholder="Коллекция, декор, артикул, дверь…"
                  className="w-full bg-transparent text-2xl font-light tracking-tight text-ink outline-none placeholder:text-ink-faint md:text-3xl"
                />
                {q && (
                  <button type="button" onClick={() => setQ('')} className="shrink-0 text-sm text-ink-faint hover:text-ink">
                    Очистить
                  </button>
                )}
              </div>

              {results.length > 0 && (
                <ul id="search-results" role="listbox" className="mt-4">
                  {results.map((r, i) => (
                    <li key={r.href} id={`sr-${i}`} role="option" aria-selected={i === active}>
                      <a
                        href={r.href}
                        onClick={(e) => {
                          e.preventDefault();
                          go(r);
                        }}
                        onMouseEnter={() => setActive(i)}
                        className={`flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors duration-100 ${i === active ? 'bg-surface' : ''}`}
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface2">
                          {r.image ? (
                            <Image src={r.image} alt="" fill sizes="48px" className="object-cover" />
                          ) : (
                            <span className="grid h-full w-full place-items-center text-ink-faint">
                              <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
                                <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-base font-medium ${i === active ? 'text-accent' : 'text-ink'}`}>{r.title}</span>
                          <span className="block truncate text-xs text-ink-faint">{r.subtitle}</span>
                        </span>
                        <span className="hidden shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-soft sm:inline">
                          {KIND_LABEL[r.kind]}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {typed && results.length === 0 && (
                <div className="py-8">
                  <p className="text-base text-ink">Ничего не нашли по запросу «{q.trim()}».</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Проверьте написание или попробуйте другое слово: название коллекции, артикул, «мрамор», «дверь». Или позвоните нам:{' '}
                    <a href={`tel:${site.phoneHref}`} className="font-medium text-ink hover:text-accent">
                      {site.phone}
                    </a>
                  </p>
                </div>
              )}

              {!typed && (
                <div className="pt-6">
                  <p className="text-sm text-ink-soft">Часто ищут</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQ(tag)}
                        className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors duration-150 hover:border-accent hover:text-accent"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
