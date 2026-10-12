/** @author Erbol king */
import { NextResponse } from 'next/server';
import { adminEnabled, checkPassword, clearFailures, COOKIE, createSession, noteFailure, tooManyAttempts } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ ok: false, error: 'Админ-панель отключена: на сервере не задан ADMIN_PASSWORD.' }, { status: 503 });
  }
  const ip = clientIp(request);
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ ok: false, error: 'Слишком много попыток. Подождите 10 минут.' }, { status: 429 });
  }

  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 });
  }

  if (!checkPassword(password)) {
    noteFailure(ip);
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ ok: false, error: 'Неверный пароль' }, { status: 401 });
  }

  clearFailures(ip);
  const session = createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  });
  return res;
}
