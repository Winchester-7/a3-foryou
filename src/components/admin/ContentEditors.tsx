'use client';

/**
 * Портфолио, акции, заявки, настройки сайта.
 * @author Erbol king
 */
import { useState } from 'react';
import type { PortfolioProject } from '@/lib/portfolio';
import type { Promotion } from '@/lib/editorial';
import { uniqueSlug } from '@/lib/slug';
import { ListDetail } from './ListDetail';
import { Btn, Card, Field, ImageList, SaveBar, TextArea, TextInput, useResource } from './ui';

/* ------------------------------------------------------------------ portfolio */

export function PortfolioEditor() {
  const r = useResource<PortfolioProject[]>('portfolio');
  const [slug, setSlug] = useState<string | null>(null);

  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const items = r.data;
  const cur = items.find((p) => p.slug === slug) ?? null;
  const patch = (p: Partial<PortfolioProject>) => r.update((d) => d.map((x) => (x.slug === slug ? { ...x, ...p } : x)));

  const add = () => {
    const s = uniqueSlug('novyy-proekt', items.map((x) => x.slug));
    r.update((list) => [{ slug: s, title: 'Новый проект', kind: 'Интерьер', cover: '', gallery: [] }, ...list]);
    setSlug(s);
  };
  const remove = () => {
    if (!cur || !confirm(`Удалить проект «${cur.title}»?`)) return;
    r.update((list) => list.filter((x) => x.slug !== cur.slug));
    setSlug(null);
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />
      <ListDetail
        items={items}
        selected={slug}
        onSelect={setSlug}
        onAdd={add}
        addLabel="+ Новый проект"
        title={(p) => p.title}
        subtitle={(p) => p.kind}
        thumb={(p) => p.cover}
        emptyHint="Выберите проект слева или добавьте новый. Для проекта нужно хотя бы одно фото."
      >
        {cur && (
          <>
            <Card
              title="Проект"
              aside={
                <Btn kind="danger" onClick={remove}>
                  Удалить
                </Btn>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Название" className="sm:col-span-2">
                  <TextInput value={cur.title} onChange={(v) => patch({ title: v })} />
                </Field>
                <Field label="Тип помещения">
                  <TextInput value={cur.kind} onChange={(v) => patch({ kind: v })} placeholder="Гостиная, Ванная, Кухня…" />
                </Field>
                <Field label="Год">
                  <TextInput type="number" value={cur.year} onChange={(v) => patch({ year: Number(v) || undefined })} />
                </Field>
                <Field label="Подзаголовок" className="sm:col-span-2">
                  <TextInput value={cur.subtitle} onChange={(v) => patch({ subtitle: v })} placeholder="Например: квартира 85 м², Бишкек" />
                </Field>
                <Field label="Описание" className="sm:col-span-2">
                  <TextArea value={cur.description} onChange={(v) => patch({ description: v })} />
                </Field>
                <Field label="Коллекции в проекте" hint="Адреса коллекций через запятую (например: lusso, gerda)" className="sm:col-span-2">
                  <TextInput
                    value={(cur.collections ?? []).join(', ')}
                    onChange={(v) => patch({ collections: v.split(',').map((s) => s.trim()).filter(Boolean) })}
                  />
                </Field>
              </div>
            </Card>
            <Card title="Фото">
              <ImageList
                images={[cur.cover, ...cur.gallery.filter((g) => g !== cur.cover)].filter(Boolean)}
                onChange={(imgs) => patch({ cover: imgs[0] ?? '', gallery: imgs })}
              />
            </Card>
          </>
        )}
      </ListDetail>
    </>
  );
}

/* ------------------------------------------------------------------ promotions */

export function PromotionsEditor() {
  const r = useResource<Promotion[]>('promotions');
  const [slug, setSlug] = useState<string | null>(null);

  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const items = r.data;
  const cur = items.find((p) => p.slug === slug) ?? null;
  const patch = (p: Partial<Promotion>) => r.update((d) => d.map((x) => (x.slug === slug ? { ...x, ...p } : x)));

  const add = () => {
    const s = uniqueSlug('novaya-akciya', items.map((x) => x.slug));
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    r.update((list) => [
      { slug: s, title: 'Новая акция', offer: '−10%', description: '', until: d.toISOString().slice(0, 10), imageSeed: 'promo-' + s },
      ...list,
    ]);
    setSlug(s);
  };
  const remove = () => {
    if (!cur || !confirm(`Удалить акцию «${cur.title}»?`)) return;
    r.update((list) => list.filter((x) => x.slug !== cur.slug));
    setSlug(null);
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />
      <ListDetail
        items={items}
        selected={slug}
        onSelect={setSlug}
        onAdd={add}
        addLabel="+ Новая акция"
        title={(p) => p.title}
        subtitle={(p) => `${p.offer} · до ${p.until}`}
        emptyHint="Выберите акцию слева или добавьте новую."
      >
        {cur && (
          <Card
            title="Акция"
            aside={
              <Btn kind="danger" onClick={remove}>
                Удалить
              </Btn>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Название" className="sm:col-span-2">
                <TextInput value={cur.title} onChange={(v) => patch({ title: v })} />
              </Field>
              <Field label="Размер выгоды" hint="Например: −25%, 0 сом, Бонус">
                <TextInput value={cur.offer} onChange={(v) => patch({ offer: v })} />
              </Field>
              <Field label="Действует до">
                <TextInput type="date" value={cur.until} onChange={(v) => patch({ until: v })} />
              </Field>
              <Field label="Описание" className="sm:col-span-2">
                <TextArea value={cur.description} onChange={(v) => patch({ description: v })} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={Boolean(cur.accent)} onChange={(e) => patch({ accent: e.target.checked })} />
                Выделить цветом
              </label>
            </div>
          </Card>
        )}
      </ListDetail>
    </>
  );
}

/* ------------------------------------------------------------------ leads */

interface Lead {
  id: string;
  at: string;
  kind: string;
  subject: string;
  name: string;
  phone: string;
  message: string;
  done: boolean;
}

export function LeadsView() {
  const r = useResource<Lead[]>('leads');
  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const leads = r.data;

  const csv = () => {
    const rows = [['Дата', 'Имя', 'Телефон', 'Тип', 'Тема', 'Сообщение', 'Обработана']].concat(
      leads.map((l) => [l.at, l.name, l.phone, l.kind, l.subject, l.message, l.done ? 'да' : 'нет']),
    );
    const text = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zayavki.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">Заявок: {leads.length}</p>
        <Btn kind="outline" onClick={csv} disabled={!leads.length}>
          Скачать CSV
        </Btn>
      </div>
      {leads.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">Заявок пока нет. Они появятся здесь, когда клиенты отправят форму на сайте.</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {leads.map((l) => (
            <li key={l.id} className={`rounded-2xl border p-4 ${l.done ? 'border-line opacity-60' : 'border-ink'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {l.name} · <a href={`tel:${l.phone}`} className="text-accent">{l.phone}</a>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {new Date(l.at).toLocaleString('ru-RU')} · {l.kind || 'заявка'}
                    {l.subject ? ` · ${l.subject}` : ''}
                  </p>
                  {l.message && <p className="mt-2 text-sm text-ink-soft">{l.message}</p>}
                </div>
                <div className="flex gap-2">
                  <Btn kind="outline" onClick={() => r.update((d) => d.map((x) => (x.id === l.id ? { ...x, done: !x.done } : x)))}>
                    {l.done ? 'Вернуть' : 'Обработана'}
                  </Btn>
                  <Btn kind="danger" onClick={() => confirm('Удалить заявку?') && r.update((d) => d.filter((x) => x.id !== l.id))}>
                    Удалить
                  </Btn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ settings */

type Settings = Record<string, string>;

export function SettingsEditor() {
  const r = useResource<Settings>('settings');
  if (r.loading || !r.data) return <p className="text-sm text-ink-faint">Загрузка…</p>;
  const s = r.data;
  const set = (k: string, v: string) => r.update((d) => ({ ...d, [k]: v }));

  return (
    <>
      <SaveBar dirty={r.dirty} saving={r.saving} canWrite={r.canWrite} message={r.message} onSave={r.save} onReload={r.reload} />
      <Card title="Контакты на сайте">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Телефон">
            <TextInput value={s.phone} onChange={(v) => { set('phone', v); set('phoneHref', v.replace(/[^\d+]/g, '')); }} />
          </Field>
          <Field label="WhatsApp (ссылка)" hint="https://wa.me/996XXXXXXXXX">
            <TextInput value={s.whatsapp} onChange={(v) => set('whatsapp', v)} />
          </Field>
          <Field label="WhatsApp (номер для подписи)">
            <TextInput value={s.whatsappNumber} onChange={(v) => set('whatsappNumber', v)} />
          </Field>
          <Field label="Почта">
            <TextInput value={s.email} onChange={(v) => set('email', v)} />
          </Field>
          <Field label="Адрес" className="sm:col-span-2">
            <TextInput value={s.address} onChange={(v) => set('address', v)} />
          </Field>
          <Field label="Улица (для поисковиков)">
            <TextInput value={s.street} onChange={(v) => set('street', v)} />
          </Field>
          <Field label="Часы работы">
            <TextInput value={s.hours} onChange={(v) => set('hours', v)} />
          </Field>
          <Field label="Instagram (ссылка)" className="sm:col-span-2">
            <TextInput value={s.instagram} onChange={(v) => set('instagram', v)} />
          </Field>
          <Field label="Короткое описание компании (подвал сайта)" className="sm:col-span-2">
            <TextArea value={s.shortDescription} onChange={(v) => set('shortDescription', v)} rows={3} />
          </Field>
        </div>
      </Card>
    </>
  );
}
