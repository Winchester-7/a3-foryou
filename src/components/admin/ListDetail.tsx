'use client';

/** @author Erbol king */
import { useMemo, useState, type ReactNode } from 'react';
import { Btn, TextInput } from './ui';

/** Left column: searchable list. Right column: whatever the editor renders for the selected item. */
export function ListDetail<T extends { slug: string }>({
  items,
  selected,
  onSelect,
  onAdd,
  addLabel,
  title,
  subtitle,
  thumb,
  searchText,
  filters,
  children,
  emptyHint,
}: {
  items: T[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  onAdd: () => void;
  addLabel: string;
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  thumb?: (item: T) => string | undefined;
  searchText?: (item: T) => string;
  filters?: ReactNode;
  children: ReactNode;
  emptyHint: string;
}) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(60);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => !q || (searchText ? searchText(it) : title(it)).toLowerCase().includes(q));
  }, [items, query, searchText, title]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside>
        <TextInput value={query} onChange={(v) => { setQuery(v); setLimit(60); }} placeholder="Поиск" />
        {filters && <div className="mt-3">{filters}</div>}
        <Btn kind="solid" className="mt-3 w-full" onClick={onAdd}>
          {addLabel}
        </Btn>
        <p className="mt-3 text-xs text-ink-faint">Найдено: {shown.length}</p>
        <ul className="mt-2 max-h-[68vh] space-y-1.5 overflow-y-auto pr-1">
          {shown.slice(0, limit).map((it) => {
            const img = thumb?.(it);
            return (
              <li key={it.slug}>
                <button
                  type="button"
                  onClick={() => onSelect(it.slug)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected === it.slug ? 'border-ink bg-surface' : 'border-line hover:border-ink-faint'
                  }`}
                >
                  {thumb && (
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{title(it)}</span>
                    {subtitle && <span className="block truncate text-xs text-ink-faint">{subtitle(it)}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {shown.length > limit && (
          <Btn kind="outline" className="mt-3 w-full" onClick={() => setLimit((n) => n + 60)}>
            Показать ещё ({shown.length - limit})
          </Btn>
        )}
      </aside>

      <div className="space-y-5">
        {selected ? children : <div className="rounded-2xl border border-line p-5 text-sm text-ink-soft">{emptyHint}</div>}
      </div>
    </div>
  );
}
