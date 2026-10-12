'use client';

/**
 * Диваны и кресла.
 * @author Erbol king
 */
import { useState } from 'react';
import type { SofaModel } from '@/lib/sofas';
import { uniqueSlug } from '@/lib/slug';
import { ListDetail } from './ListDetail';
import { SpecsEditor } from './DoorsEditor';
import { Btn, Card, Field, ImageList, SaveBar, SelectInput, TextArea, TextInput, useResource } from './ui';

export function SofasEditor() {
  const r = useResource<SofaModel[]>('sofas');
  const [slug, setSlug] = useState<string | null>(null);

  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const sofas = r.data;
  const cur = sofas.find((s) => s.slug === slug) ?? null;
  const patch = (p: Partial<SofaModel>) => r.update((d) => d.map((x) => (x.slug === slug ? { ...x, ...p } : x)));

  const add = () => {
    const s = uniqueSlug('novyy-divan', sofas.map((x) => x.slug));
    const m: SofaModel = {
      slug: s,
      name: 'Новая модель',
      brand: 'Delavega',
      kind: 'Диван',
      description: '',
      frame: '',
      legs: '',
      filler: '',
      sizes: ['200 × 95'],
      fabrics: [{ name: 'Латте', hex: '#cdbfa8' }],
      custom: false,
      specs: [],
      hero: '',
      image: '',
      gallery: [],
    };
    r.update((list) => [m, ...list]);
    setSlug(s);
  };

  const remove = () => {
    if (!cur || !confirm(`Удалить модель «${cur.name}»?`)) return;
    r.update((list) => list.filter((x) => x.slug !== cur.slug));
    setSlug(null);
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />
      <ListDetail
        items={sofas}
        selected={slug}
        onSelect={setSlug}
        onAdd={add}
        addLabel="+ Новая модель"
        title={(s) => `${s.kind} ${s.name}`}
        subtitle={(s) => s.sizes.join(', ')}
        thumb={(s) => s.image}
        searchText={(s) => `${s.name} ${s.kind} ${s.slug}`}
        emptyHint="Выберите модель слева или добавьте новую."
      >
        {cur && (
          <>
            <Card
              title="Модель"
              aside={
                <Btn kind="danger" onClick={remove}>
                  Удалить
                </Btn>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Название">
                  <TextInput value={cur.name} onChange={(v) => patch({ name: v })} />
                </Field>
                <Field label="Вид">
                  <SelectInput value={cur.kind} onChange={(v) => patch({ kind: v as SofaModel['kind'] })} options={[['Диван', 'Диван'], ['Кресло', 'Кресло']]} />
                </Field>
                <Field label="Бренд">
                  <TextInput value={cur.brand} onChange={(v) => patch({ brand: v })} />
                </Field>
                <Field label="Размеры" hint="Через запятую, см: 200 × 95, 230 × 95">
                  <TextInput value={cur.sizes.join(', ')} onChange={(v) => patch({ sizes: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
                </Field>
                <Field label="Описание" className="sm:col-span-2">
                  <TextArea value={cur.description} onChange={(v) => patch({ description: v })} />
                </Field>
                <Field label="Каркас">
                  <TextInput value={cur.frame} onChange={(v) => patch({ frame: v })} />
                </Field>
                <Field label="Ножки">
                  <TextInput value={cur.legs} onChange={(v) => patch({ legs: v })} />
                </Field>
                <Field label="Наполнитель" className="sm:col-span-2">
                  <TextInput value={cur.filler} onChange={(v) => patch({ filler: v })} />
                </Field>
              </div>
            </Card>

            <Card title="Ткани и цвета">
              <div className="space-y-2">
                {cur.fabrics.map((c, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#b9a38a'}
                      onChange={(e) => patch({ fabrics: cur.fabrics.map((x, k) => (k === i ? { ...x, hex: e.target.value } : x)) })}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-paper"
                    />
                    <TextInput value={c.name} onChange={(v) => patch({ fabrics: cur.fabrics.map((x, k) => (k === i ? { ...x, name: v } : x)) })} placeholder="Название" />
                    <button type="button" className="px-2 text-lg text-accent" aria-label="Убрать" onClick={() => patch({ fabrics: cur.fabrics.filter((_, k) => k !== i) })}>
                      ×
                    </button>
                  </div>
                ))}
                <Btn kind="outline" onClick={() => patch({ fabrics: [...cur.fabrics, { name: '', hex: '#b9a38a' }] })}>
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
