import { NextResponse } from 'next/server';
import { runCommand } from '@/lib/bot/commands';
import { sendMessage, setWebhook, type TgUpdate } from '@/lib/bot/telegram';

/**
 * Telegram webhook for the admin bot. Only users listed in TELEGRAM_ADMIN_IDS
 * may change the site; everybody else gets a polite refusal.
 * @author Erbol king
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const admins = () =>
  (process.env.TELEGRAM_ADMIN_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const msg = update.message;
  if (!msg) return NextResponse.json({ ok: true });

  const userId = String(msg.from?.id ?? '');
  if (!admins().includes(userId)) {
    await sendMessage(msg.chat.id, `Нет доступа. Ваш Telegram ID: <code>${userId}</code>`);
    return NextResponse.json({ ok: true });
  }

  try {
    const reply = await runCommand(msg);
    await sendMessage(msg.chat.id, reply);
  } catch (e) {
    console.error('[telegram-bot]', e);
    await sendMessage(msg.chat.id, '⚠️ Не получилось выполнить команду. Попробуйте ещё раз или проверьте настройки сервера.');
  }
  // Always 200 — otherwise Telegram keeps retrying the same update.
  return NextResponse.json({ ok: true });
}

/** One-off setup: open /api/telegram?key=<TELEGRAM_WEBHOOK_SECRET> to register the webhook. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || url.searchParams.get('key') !== secret) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const result = await setWebhook(`${url.origin}/api/telegram`, secret);
  return NextResponse.json(result);
}
