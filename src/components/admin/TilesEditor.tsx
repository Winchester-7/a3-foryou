'use client';

/**
 * Керамогранит: коллекции, позиции, остатки и фото.
 * @author Erbol king
 */
import { useMemo, useState } from 'react';
import type { Collection, Product, StockLine } from '@/lib/types';
import { BRAND_NAMES } from '@/lib/brands';
import { looks } from '@/lib/looks';
import { slugify, uniqueSlug } from '@/lib/slug';
import { Btn, Card, Field, ImageList, SaveBar, SelectInput, TextArea, TextInput, useResource } from './ui';

type TilesFile = { generated?: string; collections: Collection[] };

const SURFACES = ['', 'Матовая', 'Полированная', 'Лаппатированная', 'Структурная', 'Мягкая матовая', 'Рельефная'];
const BRAND_OPTIONS: [string, string][] = Object.entries(BRAND_NAMES);
const LOOK_OPTIONS: [string, string][] = looks.map((l) => [l.slug, l.short]);

const m2Of = (p: Product) => Math.round((p.stock ?? []).reduce((n, s) => n + (Number(s.m2) || 0), 0));

export function TilesEditor() {
  const r = useResource<TilesFile>('tiles');
  const [query, setQuery] = useState('');
  const [slug, setSlug] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const collections = r.data?.collections ?? [];
  const current = collections.find((c) => c.slug === slug) ?? null;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections.filter(
      (c) =>
        !q ||
        `${c.nameRu} ${c.name} ${c.slug}`.toLowerCase().includes(q) ||
        c.products.some((p) => `${p.nameRu} ${p.article ?? ''}`.toLowerCase().includes(q)),
    );
  }, [collections, query]);

  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;

  const patchCollection = (patch: Partial<Collection>) =>
    r.update((d) => ({ ...d, collections: d.collections.map((c) => (c.slug === slug ? { ...c, ...patch } : c)) }));

  const patchProduct = (pslug: string, patch: Partial<Product>) =>
    patchCollection({ products: current!.products.map((p) => (p.slug === pslug ? { ...p, ...patch } : p)) });

  const addCollection = () => {
    const s = uniqueSlug('novaya-kollekciya', collections.map((c) => c.slug));
    const c: Collection = {
      slug: s,
      name: 'Новая коллекция',
      nameRu: 'Новая коллекция',
      brand: 'idalgo',
      look: 'stone',
      sizes: [],
      surfaces: [],
      thickness: '',
      applications: [],
      tagline: '',
      description: '',
      hero: '',
      gallery: [],
      swatches: [],
      products: [],
    };
    r.update((d) => ({ ...d, collections: [c, ...d.collections] }));
    setSlug(s);
  };

  const removeCollection = () => {
    if (!current || !confirm(`Удалить коллекцию «${current.nameRu}» вместе со всеми позициями?`)) return;
    r.update((d) => ({ ...d, collections: d.collections.filter((c) => c.slug !== current.slug) }));
    setSlug(null);
  };

  const addProduct = () => {
    if (!current) return;
    const taken = collections.flatMap((c) => c.products.map((p) => p.slug));
    const s = uniqueSlug(slugify(`${current.slug}-novaya-pozitsiya`), taken);
    const p: Product = { slug: s, name: 'Новая позиция', nameRu: 'Новая позиция', color: '', sizes: [], surfaces: [], image: '', images: [], stock: [] };
    patchCollection({ products: [p, ...current.products] });
    setOpen(s);
  };

  const removeProduct = (p: Product) => {
    if (!current || !confirm(`Удалить позицию «${p.nameRu}»?`)) return;
    patchCollection({ products: current.products.filter((x) => x.slug !== p.slug) });
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* collections list */}
        <aside>
          <div className="flex gap-2">
            <TextInput value={query} onChange={setQuery} placeholder="Поиск коллекции или позиции" />
          </div>
          <Btn kind="solid" className="mt-3 w-full" onClick={addCollection}>
            + Новая коллекция
          </Btn>
          <ul className="mt-4 max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
            {list.map((c) => {
              const total = c.products.reduce((n, p) => n + m2Of(p), 0);
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(c.slug);
                      setOpen(null);
                    }}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      slug === c.slug ? 'border-ink bg-surface' : 'border-line hover:border-ink-faint'
                    }`}
                  >
                    <span className="block text-sm font-medium text-ink">{c.nameRu}</span>
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      {BRAND_NAMES[c.brand] ?? c.brand} · {c.products.length} поз. · {total.toLocaleString('ru-RU')} м²
                    </span>
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="px-1 text-sm text-ink-faint">Ничего не найдено</li>}
          </ul>
        </aside>

        {/* editor */}
        <div className="space-y-5">
          {!current ? (
            <Card>
              <p className="text-sm text-ink-soft">Выберите коллекцию слева или создайте новую.</p>
            </Card>
          ) : (
            <>
              <Card
                title="Коллекция"
                aside={
                  <Btn kind="danger" onClick={removeCollection}>
                    Удалить коллекцию
                  </Btn>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Название (рус.)">
                    <TextInput value={current.nameRu} onChange={(v) => patchCollection({ nameRu: v })} />
                  </Field>
                  <Field label="Название (лат.)">
                    <TextInput value={current.name} onChange={(v) => patchCollection({ name: v })} />
                  </Field>
                  <Field label="Производитель">
                    <SelectInput value={current.brand} onChange={(v) => patchCollection({ brand: v as Collection['brand'] })} options={BRAND_OPTIONS} />
                  </Field>
                  <Field label="Тип поверхности">
                    <SelectInput value={current.look} onChange={(v) => patchCollection({ look: v as Collection['look'] })} options={LOOK_OPTIONS} />
                  </Field>
                  <Field label="Короткая подпись" className="sm:col-span-2">
                    <TextInput value={current.tagline} onChange={(v) => patchCollection({ tagline: v })} />
                  </Field>
                  <Field label="Описание" hint="Если пусто — подставится общее описание типа поверхности" className="sm:col-span-2">
                    <TextArea value={current.description} onChange={(v) => patchCollection({ description: v })} rows={3} />
                  </Field>
                  <Field label="Интерьерные фото коллекции" hint="Главное фото используется в баннере и карточке коллекции" className="sm:col-span-2">
                    <ImageList
                      images={[current.hero, ...current.gallery.filter((g) => g !== current.hero)].filter(Boolean)}
                      onChange={(imgs) => patchCollection({ hero: imgs[0] ?? '', gallery: imgs })}
                    />
                  </Field>
                </div>
              </Card>

              <Card
                title={`Позиции (${current.products.length})`}
                aside={
                  <Btn kind="solid" onClick={addProduct}>
                    + Добавить позицию
                  </Btn>
                }
              >
                <ul className="space-y-3">
                  {current.products.map((p) => (
                    <li key={p.slug} className="rounded-xl border border-line">
                      <button
                        type="button"
                        onClick={() => setOpen(open === p.slug ? null : p.slug)}
                        className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                      >
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                          {p.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{p.nameRu}</span>
                          <span className="block truncate text-xs text-ink-faint">
                            {[p.article, p.sizes.join(', ')].filter(Boolean).join(' · ') || 'без размеров'}
                          </span>
                        </span>
                        <span className="text-xs tabular-nums text-ink-soft">{m2Of(p).toLocaleString('ru-RU')} м²</span>
                      </button>

                      {open === p.slug && (
                        <div className="space-y-4 border-t border-line p-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Название (рус.)">
                              <TextInput value={p.nameRu} onChange={(v) => patchProduct(p.slug, { nameRu: v })} />
                            </Field>
                            <Field label="Название (лат.)">
                              <TextInput value={p.name} onChange={(v) => patchProduct(p.slug, { name: v })} />
                            </Field>
                            <Field label="Артикул">
                              <TextInput value={p.article} onChange={(v) => patchProduct(p.slug, { article: v || undefined })} />
                            </Field>
                            <Field label="Цвет / декор">
                              <TextInput value={p.color} onChange={(v) => patchProduct(p.slug, { color: v })} />
                            </Field>
                          </div>

                          <Field label="Остатки на складе">
                            <StockEditor stock={p.stock ?? []} onChange={(stock) => patchProduct(p.slug, { stock })} />
                          </Field>

                          <Field label="Фото позиции" hint="Первое фото — главное">
                            <ImageList
                              images={p.images.length ? p.images : p.image ? [p.image] : []}
                              onChange={(imgs) => patchProduct(p.slug, { images: imgs, image: imgs[0] ?? '' })}
                            />
                          </Field>

                          <div className="flex justify-end">
                            <Btn kind="danger" onClick={() => removeProduct(p)}>
                              Удалить позицию
                            </Btn>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                  {current.products.length === 0 && <li className="text-sm text-ink-faint">В коллекции пока нет позиций.</li>}
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function StockEditor({ stock, onChange }: { stock: StockLine[]; onChange: (s: StockLine[]) => void }) {
  const set = (i: number, patch: Partial<StockLine>) => onChange(stock.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-2">
      {stock.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_auto] items-center gap-2">
          <TextInput value={s.size} onChange={(v) => set(i, { size: v })} placeholder="1200×600" />
          <SelectInput value={s.surface} onChange={(v) => set(i, { surface: v })} options={SURFACES.map((x) => [x, x || 'Поверхность'])} />
          <TextInput type="number" value={s.pcs} onChange={(v) => set(i, { pcs: Number(v) || 0 })} placeholder="шт." />
          <TextInput type="number" value={s.m2} onChange={(v) => set(i, { m2: Number(v) || 0 })} placeholder="м²" />
          <button type="button" aria-label="Удалить строку" className="px-2 text-lg text-accent" onClick={() => onChange(stock.filter((_, k) => k !== i))}>
            ×
          </button>
        </div>
      ))}
      <Btn kind="outline" onClick={() => onChange([...stock, { size: '', surface: '', pcs: 0, m2: 0 }])}>
        + Формат
      </Btn>
      {stock.length > 0 && <p className="text-xs text-ink-faint">Колонки: формат (мм) · поверхность · штук · м²</p>}
    </div>
  );
}
