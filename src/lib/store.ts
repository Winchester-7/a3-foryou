/**
 * File-based data store for everything the admin panel edits.
 *
 * - With DATA_DIR set (Docker volume), JSON files in that folder are the source of truth.
 *   Every read checks the file's modification time, so a change made in the admin panel
 *   is visible on the very next request — no rebuild, no restart.
 * - Without DATA_DIR (local preview, Netlify) the data bundled with the build is used
 *   and the store is read-only.
 *
 * Server-only: never import this module from a client component.
 * @author Erbol king
 */
import fs from 'node:fs';
import path from 'node:path';
import tilesSeed from '@/data/tiles.json';
import doorsSeed from '@/data/doors.json';
import sofasSeed from '@/data/sofas.json';
import portfolioSeed from '@/data/portfolio.json';
import promotionsSeed from '@/data/promotions.json';
import settingsSeed from '@/data/settings.json';

export type DataName = 'tiles' | 'doors' | 'sofas' | 'portfolio' | 'promotions' | 'settings' | 'leads';

const SEEDS: Record<DataName, unknown> = {
  tiles: tilesSeed,
  doors: doorsSeed,
  sofas: sofasSeed,
  portfolio: portfolioSeed,
  promotions: promotionsSeed,
  settings: settingsSeed,
  leads: [],
};

const DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : null;

/** true when the admin panel can save changes */
export const canWrite: boolean = DIR !== null;

const fileOf = (name: DataName) => (DIR ? path.join(DIR, `${name}.json`) : null);

const cache = new Map<DataName, { mtime: number; value: unknown }>();

export function readData<T>(name: DataName): T {
  const file = fileOf(name);
  if (file) {
    try {
      const st = fs.statSync(file);
      const hit = cache.get(name);
      if (hit && hit.mtime === st.mtimeMs) return hit.value as T;
      const value = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
      cache.set(name, { mtime: st.mtimeMs, value });
      return value as T;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') console.error(`[store] cannot read ${name}.json`, e);
    }
  }
  return SEEDS[name] as T;
}

/** Changes whenever any data file changes — used by the admin panel to detect stale forms. */
export function dataVersion(name: DataName): string {
  const file = fileOf(name);
  if (!file) return 'seed';
  try {
    return String(fs.statSync(file).mtimeMs);
  } catch {
    return 'seed';
  }
}

let writing: Promise<void> = Promise.resolve();

/** Atomic write (temp file + rename), serialised so two saves never interleave. */
export function writeData(name: DataName, value: unknown): Promise<void> {
  const file = fileOf(name);
  if (!file || !DIR) return Promise.reject(new Error('read-only'));
  const run = async () => {
    await fs.promises.mkdir(DIR, { recursive: true });
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(value, null, 1) + '\n', 'utf8');
    await fs.promises.rename(tmp, file);
    cache.delete(name);
  };
  const next = writing.then(run, run);
  writing = next.catch(() => undefined);
  return next;
}

export const uploadsDir = (): string | null => (DIR ? path.join(DIR, 'uploads') : null);
