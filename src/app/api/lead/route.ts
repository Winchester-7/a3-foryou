/** @author Erbol king */
import { NextResponse } from 'next/server';
import { canWrite, readData, writeData } from '@/lib/store';

export const dynamic = 'force-dynamic';

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

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Callback / consultation requests from the site forms. They are stored in the
 * data volume and shown in the admin panel («Заявки»).
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const name = clean(payload.name, 120);
  const phone = clean(payload.phone, 40);
  if (!name || !phone) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });

  const lead: Lead = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    kind: clean(payload.kind, 40),
    subject: clean(payload.subject, 300),
    name,
    phone,
    message: clean(payload.message ?? payload.comment, 2000),
    done: false,
  };

  if (canWrite) {
    try {
      const list = readData<Lead[]>('leads');
      await writeData('leads', [lead, ...list].slice(0, 2000));
    } catch (e) {
      console.error('[lead] cannot store', e);
    }
  } else {
    console.info('[lead]', { kind: lead.kind, subject: lead.subject, name: lead.name, phone: lead.phone });
  }

  return NextResponse.json({ ok: true });
}
