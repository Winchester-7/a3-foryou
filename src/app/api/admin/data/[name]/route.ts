/** @author Erbol king */
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { validate } from '@/lib/admin-validate';
import { canWrite, dataVersion, readData, writeData, type DataName } from '@/lib/store';

export const dynamic = 'force-dynamic';

const NAMES: DataName[] = ['tiles', 'doors', 'sofas', 'portfolio', 'promotions', 'settings', 'leads'];
const asName = (v: string): DataName | null => (NAMES.includes(v as DataName) ? (v as DataName) : null);

const deny = () => NextResponse.json({ ok: false, error: 'Нужно войти в админ-панель' }, { status: 401 });

export async function GET(_req: Request, { params }: { params: { name: string } }) {
  if (!isAdmin()) return deny();
  const name = asName(params.name);
  if (!name) return NextResponse.json({ ok: false, error: 'Неизвестный раздел' }, { status: 404 });
  return NextResponse.json({ ok: true, data: readData(name), version: dataVersion(name), canWrite });
}

export async function PUT(request: Request, { params }: { params: { name: string } }) {
  if (!isAdmin()) return deny();
  const name = asName(params.name);
  if (!name) return NextResponse.json({ ok: false, error: 'Неизвестный раздел' }, { status: 404 });
  if (!canWrite) {
    return NextResponse.json(
      { ok: false, error: 'Это демонстрационная версия без хранилища: на сервере не задан DATA_DIR, сохранение отключено.' },
      { status: 503 },
    );
  }

  let body: { data?: unknown; version?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 });
  }

  // somebody else saved in the meantime — never overwrite their work silently
  if (typeof body.version === 'string' && body.version !== dataVersion(name)) {
    return NextResponse.json(
      { ok: false, error: 'Данные изменились на сервере после того, как вы их открыли. Обновите страницу и повторите.', conflict: true },
      { status: 409 },
    );
  }

  const checked = validate(name, body.data);
  if (!checked.ok) return NextResponse.json({ ok: false, error: checked.error }, { status: 422 });

  try {
    await writeData(name, checked.data);
  } catch (e) {
    console.error('[admin] save failed', e);
    return NextResponse.json({ ok: false, error: 'Не удалось записать данные на сервере' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: checked.data, version: dataVersion(name) });
}
