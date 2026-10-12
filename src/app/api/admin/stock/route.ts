/**
 * Excel import of the warehouse list.
 *   POST multipart: file (.xlsx), mode = preview | apply, addNew, zeroMissing, version (for apply)
 * «preview» changes nothing and returns the report; «apply» re-reads the same file,
 * validates the result like any other admin save and writes it.
 * @author Erbol king
 */
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { validate } from '@/lib/admin-validate';
import type { TilesFile } from '@/lib/collections';
import { parseWorkbook, planImport } from '@/lib/stock-import';
import { canWrite, dataVersion, readData, writeData } from '@/lib/store';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
const fail = (error: string, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });

export async function POST(request: Request) {
  if (!isAdmin()) return fail('Нужно войти в админ-панель', 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('Некорректный запрос', 400);
  }
  const file = form.get('file');
  if (!(file instanceof File)) return fail('Файл не передан', 400);
  if (file.size > MAX_BYTES) return fail('Файл больше 5 МБ', 413);

  const buf = Buffer.from(await file.arrayBuffer());
  // .xlsx is a zip archive: «PK» header
  if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) return fail('Нужен файл Excel в формате .xlsx', 415);

  const mode = form.get('mode') === 'apply' ? 'apply' : 'preview';
  const opts = { addNew: form.get('addNew') !== 'false', zeroMissing: form.get('zeroMissing') !== 'false' };

  let parsed;
  try {
    parsed = await parseWorkbook(buf);
  } catch (e) {
    console.error('[admin] xlsx parse failed', e);
    return fail('Не удалось прочитать файл. Сохраните таблицу как «Книга Excel (.xlsx)» и загрузите снова.', 422);
  }
  if (!parsed.rows.length) {
    return fail('В файле не найдено строк с остатками. Ожидаются листы по заводам со столбцами «Наименование», «размер», «штук», «м2».', 422);
  }

  const { next, report } = planImport(readData<TilesFile>('tiles'), parsed, opts);

  if (mode === 'preview') {
    return NextResponse.json({ ok: true, report, version: dataVersion('tiles'), canWrite });
  }

  if (!canWrite) {
    return fail('Это демонстрационная версия без хранилища: на сервере не задан DATA_DIR, сохранение отключено.', 503);
  }
  const version = form.get('version');
  if (typeof version === 'string' && version !== dataVersion('tiles')) {
    return fail('Каталог изменился после предпросмотра. Загрузите файл ещё раз.', 409, { conflict: true });
  }

  const checked = validate('tiles', next);
  if (!checked.ok) return fail(checked.error, 422);
  try {
    await writeData('tiles', checked.data);
  } catch (e) {
    console.error('[admin] stock import save failed', e);
    return fail('Не удалось записать данные на сервере', 500);
  }
  return NextResponse.json({ ok: true, report, version: dataVersion('tiles'), canWrite, applied: true });
}
