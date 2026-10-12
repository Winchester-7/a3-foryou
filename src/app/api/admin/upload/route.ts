/** @author Erbol king */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { canWrite, uploadsDir } from '@/lib/store';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024;

/** Detects the real image type from the first bytes — the file name and mime type are not trusted. */
function sniff(buf: Buffer): 'jpg' | 'png' | 'webp' | 'avif' | null {
  if (buf.length > 12) {
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
    if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
    if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
    if (buf.subarray(4, 12).toString('ascii').startsWith('ftypavif')) return 'avif';
  }
  return null;
}

export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ ok: false, error: 'Нужно войти в админ-панель' }, { status: 401 });
  const dir = uploadsDir();
  if (!canWrite || !dir) {
    return NextResponse.json({ ok: false, error: 'Загрузка фото недоступна: на сервере не задан DATA_DIR.' }, { status: 503 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get('file');
    file = f instanceof File ? f : null;
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 });
  }
  if (!file) return NextResponse.json({ ok: false, error: 'Файл не передан' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: 'Файл больше 10 МБ' }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) return NextResponse.json({ ok: false, error: 'Нужна картинка JPG, PNG, WebP или AVIF' }, { status: 415 });

  const month = new Date().toISOString().slice(0, 7);
  const name = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const folder = path.join(dir, month);
  await fs.promises.mkdir(folder, { recursive: true });
  await fs.promises.writeFile(path.join(folder, name), buf);

  return NextResponse.json({ ok: true, url: `/uploads/${month}/${name}` });
}
