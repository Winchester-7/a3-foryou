'use client';

/**
 * Шурупы, дюбели, гвозди.
 * @author Erbol king
 */
import { useState } from 'react';
import type { ScrewItem } from '@/lib/screws';
import { uniqueSlug } from '@/lib/slug';
import { ListDetail } from './ListDetail';
import { SpecsEditor } from './DoorsEditor';
import { Btn, Card, Field, ImageList, SaveBar, TextArea, TextInput, useResource } from './ui';

export function ScrewsEditor() {
  const r = useResource<ScrewItem[]>('screws');
  const [slug, setSlug] = useState<string | null>(null);

  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const items = r.data;
  const cur = items.find((s) => s.slug === slug) ?? null;
  const patch = (p: Partial<ScrewItem>) => r.update((d) => d.map((x) => (x.slug === slug ? { ...x, ...p } : x)));

  const add = () => {
    const s = uniqueSlug('novyy-krepezh', items.map((x) => x.slug));
    const m: ScrewItem = { slug: s, name: 'Новая позиция', kind: 'Саморезы', description: '', price: 0, unit: 'уп.', image: '', gallery: [], specs: [] };
    r.update((list) => [m, ...list]);
    setSlug(s);
  };

  const remove = () => {
    if (!cur || !confirm(`Удалить «${cur.name}»?`)) return;
    r.update((list) => list.filter((x) => x.slug !== cur.slug));
    setSlug(null);
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} onResetSeed={r.resetToSeed} />
      <ListDetail
        items={items}
        selected={slug}
        onSelect={setSlug}
        onAdd={add}
        addLabel="+ Новая позиция"
        title={(s) => s.name}
        subtitle={(s) => `${s.kind} · ${s.price > 0 ? `${s.price} сом / ${s.unit}` : 'цена по запросу'}`}
        thumb={(s) => s.image}
        searchText={(s) => `${s.name} ${s.kind} ${s.slug}`}
        emptyHint="Выберите позицию слева или добавьте новую."
      >
        {cur && (
          <>
            <Card
              title="Позиция"
              aside={
                <Btn kind="danger" onClick={remove}>
                  Удалить
                </Btn>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Название" className="sm:col-span-2">
                  <TextInput value={cur.name} onChange={(v) => patch({ name: v })} />
                </Field>
                <Field label="Вид" hint="По нему работает фильтр на сайте: Саморезы, Дюбели, Гвозди…">
                  <TextInput value={cur.kind} onChange={(v) => patch({ kind: v })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Цена, сом" hint="0 — «Цена по запросу»">
                    <TextInput type="number" value={cur.price} onChange={(v) => patch({ price: Math.max(0, Number(v) || 0) })} />
                  </Field>
                  <Field label="За что цена" hint="шт., уп., кг">
                    <TextInput value={cur.unit} onChange={(v) => patch({ unit: v })} />
                  </Field>
                </div>
                <Field label="Описание" className="sm:col-span-2">
                  <TextArea value={cur.description} onChange={(v) => patch({ description: v })} />
                </Field>
              </div>
            </Card>

            <Card title="Фото">
              <ImageList images={cur.gallery.length ? cur.gallery : cur.image ? [cur.image] : []} onChange={(imgs) => patch({ gallery: imgs, image: imgs[0] ?? '' })} />
            </Card>

            <Card title="Характеристики">
              <SpecsEditor specs={cur.specs} onChange={(specs) => patch({ specs })} />
            </Card>
          </>
        )}
      </ListDetail>
    </>
  );
}
