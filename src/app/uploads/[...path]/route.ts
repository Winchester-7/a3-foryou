/** @author Erbol king */
import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { uploadsDir } from '@/lib/store';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

/** Photos uploaded through the admin panel (they live in the data volume, not in /public). */
export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const root = uploadsDir();
  if (!root) return new NextResponse('Not found', { status: 404 });

  const file = path.normalize(path.join(root, ...params.path));
  if (!file.startsWith(root + path.sep)) return new NextResponse('Not found', { status: 404 });
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type) return new NextResponse('Not found', { status: 404 });

  try {
    const data = await fs.promises.readFile(file);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
