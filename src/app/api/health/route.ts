/** @author Erbol king */
import { NextResponse } from 'next/server';
import { canWrite } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Used by the Docker healthcheck and monitoring. */
export function GET() {
  return NextResponse.json({ ok: true, storage: canWrite ? 'volume' : 'read-only' });
}
