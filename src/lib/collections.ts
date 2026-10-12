/**
 * Tile catalogue — read from the data store (tiles.json), which the admin panel
 * edits. Results are memoised per file version, so reads are cheap.
 * @author Erbol king
 */
import type { Collection } from './types';
import { getLook } from './looks';
import { readData } from './store';

const KNOWN_THICKNESS = new Set(['idalgo', 'granitea']);

export type TilesFile = { generated?: string; collections: Collection[] };

const memo = new WeakMap<object, Collection[]>();

export function getCollections(): Collection[] {
  const raw = readData<TilesFile>('tiles');
  let list = memo.get(raw);
  if (!list) {
    list = (raw.collections ?? []).map((c) => ({
      ...c,
      description: c.description || getLook(c.look)?.description || '',
      thickness: KNOWN_THICKNESS.has(c.brand) ? c.thickness || '10 мм' : '',
    }));
    memo.set(raw, list);
  }
  return list;
}
