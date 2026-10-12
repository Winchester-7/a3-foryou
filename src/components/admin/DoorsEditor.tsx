'use client';

/**
 * Двери: межкомнатные и входные.
 * @author Erbol king
 */
import { useState } from 'react';
import type { DoorModel } from '@/lib/doors';
import { uniqueSlug } from '@/lib/slug';
import { ListDetail } from './ListDetail';
import { Btn, Card, Field, ImageList, SaveBar, SelectInput, TextArea, TextInput, useResource } from './ui';

export function DoorsEditor() {
  const r = useResource<DoorModel[]>('doors');
  const [slug, setSlug] = useState<string | null>(null);
  const [kind, setKind] = useState<'all' | 'interior' | 'entrance'>('all');

  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const doors = r.data;
  const visible = doors.filter((d) => kind === 'all' || (d.kind ?? 'interior') === kind);
  const cur = doors.find((d) => d.slug === slug) ?? null;

  const patch = (p: Partial<DoorModel>) => r.update((d) => d.map((x) => (x.slug === slug ? { ...x, ...p } : x)));

  const add = () => {
    const s = uniqueSlug('novaya-dver', doors.map((d) => d.slug));
    const d: DoorModel = {
      slug: s,
      name: 'Новая дверь',
      brand: '',
      style: '',
      types: ['ДГ'],
      description: '',
      colors: [{ name: 'Белый', hex: '#f2f0ec' }],
      sizes: ['800 × 2000'],
      specs: [],
      hero: '',
      image: '',
      gallery: [],
      kind: 'interior',
    };
    r.update((list) => [d, ...list]);
    setSlug(s);
  };

  const remove = () => {
    if (!cur || !confirm(`Удалить дверь «${cur.name}»?`)) return;
    r.update((list) => list.filter((x) => x.slug !== cur.slug));
    setSlug(null);
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />
      <ListDetail
        items={visible}
        selected={slug}
        onSelect={setSlug}
        onAdd={add}
        addLabel="+ Новая дверь"
        title={(d) => d.name}
        subtitle={(d) => [d.kind === 'entrance' ? 'Входная' : 'Межкомнатная', d.brand].filter(Boolean).join(' · ')}
        thumb={(d) => d.image}
        searchText={(d) => `${d.name} ${d.brand} ${d.style} ${d.slug}`}
        emptyHint="Выберите дверь слева или добавьте новую."
        filters={
          <SelectInput
            value={kind}
            onChange={(v) => setKind(v as typeof kind)}
            options={[['all', 'Все двери'], ['interior', 'Межкомнатные'], ['entrance', 'Входные']]}
          />
        }
      >
        {cur && (
          <>
            <Card
              title="Дверь"
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
                <Field label="Вид">
                  <SelectInput value={cur.kind ?? 'interior'} onChange={(v) => patch({ kind: v as DoorModel['kind'] })} options={[['interior', 'Межкомнатная'], ['entrance', 'Входная']]} />
                </Field>
                <Field label="Полотно">
                  <SelectInput value={cur.types.includes('ДО') ? 'ДО' : 'ДГ'} onChange={(v) => patch({ types: [v] })} options={[['ДГ', 'Глухое'], ['ДО', 'Со стеклом']]} />
                </Field>
                <Field label="Серия">
                  <TextInput value={cur.brand} onChange={(v) => patch({ brand: v })} />
                </Field>
                <Field label="Стиль">
                  <TextInput value={cur.style} onChange={(v) => patch({ style: v })} placeholder="Классический, Модерн, Хайтек…" />
                </Field>
                <Field label="Описание" className="sm:col-span-2">
                  <TextArea value={cur.description} onChange={(v) => patch({ description: v })} />
                </Field>
                <Field label="Размеры" hint="Через запятую, мм: 800 × 2000, 900 × 2000" className="sm:col-span-2">
                  <TextInput value={cur.sizes.join(', ')} onChange={(v) => patch({ sizes: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
                </Field>
              </div>
            </Card>

            <Card title="Цвета">
              <div className="space-y-2">
                {cur.colors.map((c, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#b9a38a'}
                      onChange={(e) => patch({ colors: cur.colors.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)) })}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-paper"
                    />
                    <TextInput value={c.name} onChange={(v) => patch({ colors: cur.colors.map((x, k) => (k === i ? { ...x, name: v } : x)) })} placeholder="Название цвета" />
                    <button type="button" className="px-2 text-lg text-accent" aria-label="Убрать цвет" onClick={() => patch({ colors: cur.colors.filter((_, k) => k !== i) })}>
                      ×
                    </button>
                  </div>
                ))}
                <Btn kind="outline" onClick={() => patch({ colors: [...cur.colors, { name: '', hex: '#b9a38a' }] })}>
                  + Цвет
                </Btn>
              </div>
            </Card>

            <Card title="Фото">
              <ImageList images={cur.gallery.length ? cur.gallery : cur.image ? [cur.image] : []} onChange={(imgs) => patch({ gallery: imgs, image: imgs[0] ?? '', hero: imgs[0] ?? '' })} />
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

export function SpecsEditor({ specs, onChange }: { specs: [string, string][]; onChange: (s: [string, string][]) => void }) {
  return (
    <div className="space-y-2">
      {specs.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
          <TextInput value={k} onChange={(nk) => onChange(specs.map((s, x) => (x === i ? [nk, s[1]] : s)))} placeholder="Параметр" />
          <TextInput value={v} onChange={(nv) => onChange(specs.map((s, x) => (x === i ? [s[0], nv] : s)))} placeholder="Значение" />
          <button type="button" className="px-2 text-lg text-accent" aria-label="Убрать" onClick={() => onChange(specs.filter((_, x) => x !== i))}>
            ×
          </button>
        </div>
      ))}
      <Btn kind="outline" onClick={() => onChange([...specs, ['', '']])}>
        + Характеристика
      </Btn>
    </div>
  );
}

