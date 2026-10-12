'use client';

/**
 * Upload of the warehouse list (.xlsx): preview of what changes, then apply.
 * @author Erbol king
 */
import { useRef, useState } from 'react';
import type { ImportReport, ProductChange } from '@/lib/stock-import';
import { Btn, Card } from './ui';

type Answer = { ok: boolean; error?: string; report?: ImportReport; version?: string; canWrite?: boolean; applied?: boolean };

const HOW: Record<ProductChange['how'], string> = {
  label: 'по названию из таблицы',
  code: 'по артикулу',
  name: 'по похожему названию',
  new: 'новая позиция',
  zeroed: 'нет в файле',
};

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

export function StockImport() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [addNew, setAddNew] = useState(true);
  const [zeroMissing, setZeroMissing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Answer | null>(null);
  const [done, setDone] = useState<ImportReport | null>(null);
  const [showAll, setShowAll] = useState(false);

  const send = async (mode: 'preview' | 'apply', version?: string): Promise<Answer> => {
    const form = new FormData();
    form.append('file', file as File);
    form.append('mode', mode);
    form.append('addNew', String(addNew));
    form.append('zeroMissing', String(zeroMissing));
    if (version) form.append('version', version);
    const res = await fetch('/api/admin/stock', { method: 'POST', body: form });
    if (res.status === 401) {
      window.location.href = '/admin';
    }
    const json = (await res.json()) as Answer;
    if (!res.ok || !json.ok) throw new Error(json.error ?? 'Не удалось обработать файл');
    return json;
  };

  const check = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setDone(null);
    setShowAll(false);
    try {
      setPreview(await send('preview'));
    } catch (e) {
      setPreview(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!file || !preview) return;
    setBusy(true);
    setError('');
    try {
      const out = await send('apply', preview.version);
      setDone(out.report ?? null);
      setPreview(null);
      setFile(null);
      if (input.current) input.current.value = '';
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const report = preview?.report;
  const changes = report ? (showAll ? report.changes : report.changes.slice(0, 25)) : [];

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Остатки из Excel</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Загрузите складскую таблицу (.xlsx, по листу на каждый завод — как «Остатки.xlsx»). Сначала покажем, что изменится; на сайте
          ничего не поменяется, пока вы не нажмёте «Применить».
        </p>
      </div>

      <Card title="1. Файл">
        <div className="flex flex-wrap items-center gap-3">
          <Btn kind="outline" onClick={() => input.current?.click()} disabled={busy}>
            Выбрать файл
          </Btn>
          <span className="text-sm text-ink-soft">{file ? file.name : 'файл не выбран'}</span>
          <input
            ref={input}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hidden
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setPreview(null);
              setDone(null);
              setError('');
            }}
          />
        </div>
        <div className="mt-4 space-y-2 text-sm text-ink">
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={zeroMissing} onChange={(e) => setZeroMissing(e.target.checked)} className="mt-0.5" />
            <span>
              Обнулить остаток у позиций, которых нет в файле
              <span className="block text-xs text-ink-faint">Только у заводов, чьи листы есть в файле. Позиции остаются на сайте без отметки «в наличии».</span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={addNew} onChange={(e) => setAddNew(e.target.checked)} className="mt-0.5" />
            <span>
              Добавить новые позиции из файла
              <span className="block text-xs text-ink-faint">Появятся в коллекции своего завода (например, «Грасаро») без фото — фото добавляется в разделе «Керамогранит».</span>
            </span>
          </label>
        </div>
        <div className="mt-4">
          <Btn kind="solid" onClick={check} disabled={!file || busy}>
            {busy && !preview ? 'Проверяю…' : 'Проверить файл'}
          </Btn>
        </div>
        {error && <p className="mt-3 text-sm text-accent">{error}</p>}
      </Card>

      {report && preview && (
        <Card
          title="2. Что изменится"
          aside={
            <Btn kind="accent" onClick={apply} disabled={busy || !preview.canWrite}>
              {busy ? 'Применяю…' : 'Применить'}
            </Btn>
          }
        >
          {!preview.canWrite && (
            <p className="mb-3 text-sm text-accent">
              Режим просмотра: на сервере не настроено хранилище (DATA_DIR), поэтому применить нельзя — предпросмотр показан для проверки файла.
            </p>
          )}
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Строк в файле" value={`${report.rows}`} hint={`в наличии: ${report.rowsInStock}`} />
            <Stat label="Остаток, м²" value={`${fmt(report.m2Before)} → ${fmt(report.m2After)}`} />
            <Stat label="Новых позиций" value={`${report.created}`} />
            <Stat label="Обнулено" value={`${report.zeroed}`} />
          </dl>
          <p className="mt-3 text-xs text-ink-faint">
            Сопоставлено: по названию из таблицы — {report.matched.label}, по артикулу — {report.matched.code}, по похожему названию —{' '}
            {report.matched.name}. Без изменений: {report.unchanged}.
          </p>
          {report.warnings.map((w) => (
            <p key={w} className="mt-2 text-sm text-accent">
              {w}
            </p>
          ))}

          {report.changes.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide2 text-ink-faint">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Позиция</th>
                    <th className="py-2 pr-3 font-medium">Как найдена</th>
                    <th className="py-2 pr-3 text-right font-medium">Было, м²</th>
                    <th className="py-2 text-right font-medium">Станет, м²</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((c, i) => (
                    <tr key={`${c.collection}${c.product}${i}`} className="border-t border-line">
                      <td className="py-2 pr-3">
                        <span className="font-medium text-ink">{c.product}</span>
                        <span className="block text-xs text-ink-faint">{c.collection}</span>
                      </td>
                      <td className="py-2 pr-3 text-ink-soft">
                        {HOW[c.how]}
                        {c.how === 'name' && c.score ? ` (${Math.round(c.score * 100)}%)` : ''}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmt(c.beforeM2)}</td>
                      <td className="py-2 text-right tabular-nums font-medium">{fmt(c.afterM2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.changes.length > 25 && (
                <button type="button" className="mt-3 text-xs text-accent" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? 'Показать меньше' : `Показать все изменения (${report.changes.length})`}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Остатки в файле совпадают с тем, что уже на сайте.</p>
          )}

          {report.unmatched.length > 0 && (
            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-medium text-ink">
                Позиции, которых не было в каталоге ({report.unmatched.length})
              </summary>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {report.unmatched.map((u, i) => (
                  <li key={u.raw + i}>
                    {u.sheet}: {u.raw} — {fmt(u.m2)} м² {u.created ? '(будет добавлена)' : u.pcs > 0 ? '(пропущена)' : '(нет в наличии)'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Card>
      )}

      {done && (
        <Card title="Готово">
          <p className="text-sm text-[#1f8f4c]">
            Остатки обновлены, изменения уже на сайте: {fmt(done.m2Before)} → {fmt(done.m2After)} м², новых позиций — {done.created}, обнулено —{' '}
            {done.zeroed}.
          </p>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3">
      <dt className="text-[11px] uppercase tracking-wide2 text-ink-faint">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-ink">{value}</dd>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
