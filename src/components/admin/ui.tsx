'use client';

/**
 * Small UI kit + data hook shared by all admin screens.
 * @author Erbol king
 */
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';

export const inputCls =
  'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink';

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide2 text-ink-faint">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string | number | undefined; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}

export function TextArea({ value, onChange, rows = 4, placeholder }: { value: string | undefined; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value ?? ''} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}

export function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function Btn({
  children,
  onClick,
  kind = 'outline',
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'solid' | 'accent' | 'outline' | 'danger' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const styles: Record<string, string> = {
    solid: 'bg-ink text-paper hover:bg-ink/90',
    accent: 'bg-accent text-paper hover:bg-accent-ink',
    outline: 'border border-line text-ink hover:border-ink',
    danger: 'border border-line text-accent hover:border-accent',
    ghost: 'text-ink-soft hover:text-ink',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wide2 transition-[background-color,border-color,color,opacity] disabled:cursor-not-allowed disabled:opacity-40 ${styles[kind]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ title, children, aside }: { title?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-5">
      {(title || aside) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ images */

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
  const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
  if (!res.ok || !json.ok || !json.url) throw new Error(json.error ?? 'Не удалось загрузить фото');
  return json.url;
}

/** Photo list: the first photo is the cover. Upload, reorder (make main) and delete. */
export function ImageList({ images, onChange, max = 20 }: { images: string[]; onChange: (next: string[]) => void; max?: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const add = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    const added: string[] = [];
    try {
      for (const f of files) added.push(await uploadImage(f));
    } catch (err) {
      setError((err as Error).message);
    }
    if (added.length) onChange([...images, ...added].slice(0, max));
    setBusy(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={src + i} className="w-28">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide2 text-paper">
                  Главное
                </span>
              )}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px]">
              {i > 0 ? (
                <button type="button" className="text-ink-soft hover:text-ink" onClick={() => onChange([src, ...images.filter((_, k) => k !== i)])}>
                  Главным
                </button>
              ) : (
                <span />
              )}
              <button type="button" className="text-accent" onClick={() => onChange(images.filter((_, k) => k !== i))}>
                Убрать
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy || images.length >= max}
          className="grid h-28 w-28 place-items-center rounded-xl border border-dashed border-line text-center text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
        >
          {busy ? 'Загрузка…' : '+ Фото'}
        </button>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={add} />
      {error && <p className="mt-2 text-xs text-accent">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ data hook */

type Loaded<T> = { data: T; version: string; canWrite: boolean };

/** Loads one data file, keeps an editable draft and saves it back. */
export function useResource<T>(name: string) {
  const [draft, setDraft] = useState<T | null>(null);
  const [meta, setMeta] = useState<{ version: string; canWrite: boolean }>({ version: '', canWrite: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data/${name}`, { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const json = (await res.json()) as { ok: boolean; error?: string } & Partial<Loaded<T>>;
      if (!json.ok || json.data === undefined) throw new Error(json.error ?? 'Не удалось загрузить данные');
      setDraft(json.data as T);
      setMeta({ version: json.version ?? '', canWrite: json.canWrite ?? false });
      setDirty(false);
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = useCallback((fn: (d: T) => T) => {
    setDraft((d) => (d === null ? d : fn(d)));
    setDirty(true);
    setMessage(null);
  }, []);

  const save = useCallback(async () => {
    if (draft === null) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/data/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: draft, version: meta.version }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; data?: T; version?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Не удалось сохранить');
      setDraft(json.data as T);
      setMeta((m) => ({ ...m, version: json.version ?? m.version }));
      setDirty(false);
      setMessage({ kind: 'ok', text: 'Сохранено — изменения уже на сайте' });
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }, [draft, meta.version, name]);

  return { data: draft, loading, saving, dirty, message, canWrite: meta.canWrite, update, save, reload: load, setMessage };
}

/** Sticky bar with the save button and the status message. */
export function SaveBar({
  dirty,
  saving,
  canWrite,
  message,
  onSave,
  onReload,
}: {
  dirty: boolean;
  saving: boolean;
  canWrite: boolean;
  message: { kind: 'ok' | 'error'; text: string } | null;
  onSave: () => void;
  onReload: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-5 flex flex-wrap items-center gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
      <Btn kind="accent" onClick={onSave} disabled={!dirty || saving || !canWrite}>
        {saving ? 'Сохраняю…' : 'Сохранить'}
      </Btn>
      {dirty && (
        <Btn kind="ghost" onClick={onReload}>
          Отменить правки
        </Btn>
      )}
      <span className="text-xs text-ink-faint">{dirty ? 'Есть несохранённые изменения' : 'Всё сохранено'}</span>
      {!canWrite && <span className="text-xs text-accent">Режим просмотра: на сервере не настроено хранилище (DATA_DIR)</span>}
      {message && <span className={`text-xs ${message.kind === 'ok' ? 'text-[#1f8f4c]' : 'text-accent'}`}>{message.text}</span>}
    </div>
  );
}
