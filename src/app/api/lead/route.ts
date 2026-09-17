import { NextResponse } from 'next/server';

/**
 * Demo lead endpoint. Logs the payload and returns success.
 * Wire this to your CRM / email provider / Telegram bot in production.
 */
export async function POST(request: Request) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  if (!data?.name || !data?.phone) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }

  // eslint-disable-next-line no-console
  console.info('[lead]', {
    kind: data.kind,
    subject: data.subject,
    name: data.name,
    phone: data.phone,
    at: new Date().toISOString(),
  });

  await new Promise((r) => setTimeout(r, 500));
  return NextResponse.json({ ok: true });
}
