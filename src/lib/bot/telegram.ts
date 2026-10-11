/**
 * Thin Telegram Bot API helpers (webhook mode, no dependencies).
 * @author Erbol king
 */

const token = () => {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  return t;
};

export interface TgPhotoSize {
  file_id: string;
  width: number;
  height: number;
}

export interface TgMessage {
  message_id: number;
  from?: { id: number; first_name?: string; username?: string };
  chat: { id: number };
  text?: string;
  caption?: string;
  photo?: TgPhotoSize[];
}

export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
}

export async function sendMessage(chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
}

/** Downloads the largest version of a photo the admin sent. */
export async function downloadPhoto(sizes: TgPhotoSize[]): Promise<Buffer> {
  const best = [...sizes].sort((a, b) => b.width * b.height - a.width * a.height)[0];
  const info = await fetch(`https://api.telegram.org/bot${token()}/getFile?file_id=${best.file_id}`);
  const json = (await info.json()) as { ok: boolean; result?: { file_path: string } };
  if (!json.ok || !json.result) throw new Error('Telegram getFile failed');
  const file = await fetch(`https://api.telegram.org/file/bot${token()}/${json.result.file_path}`);
  return Buffer.from(await file.arrayBuffer());
}

export async function setWebhook(url: string, secret: string): Promise<unknown> {
  const res = await fetch(`https://api.telegram.org/bot${token()}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, secret_token: secret, allowed_updates: ['message'] }),
  });
  return res.json();
}

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
