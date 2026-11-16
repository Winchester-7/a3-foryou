/** @author Erbol king */
import { NextResponse } from 'next/server';
import { buildIndex } from '@/lib/search-index';

export const dynamic = 'force-dynamic';

/** Built from the catalogue data (so admin changes show up); cached briefly by browsers and Cloudflare. */
export async function GET() {
  return NextResponse.json(buildIndex(), {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600' },
  });
}
