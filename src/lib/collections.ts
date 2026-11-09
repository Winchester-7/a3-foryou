/**
 * Tile catalogue — read from the data store (tiles.json), which the admin panel
 * edits. Results are memoised per file version, so reads are cheap.
 *
 * What visitors see is only what is on the shelf: a decor without stock and the
 * factories we do not sell (HIDDEN_BRANDS) are left out; the admin panel still
 * shows and edits everything.
 * @author Erbol king
 */
import type { Collection, Product } from './types';
import { HIDDEN_BRANDS } from './brands';
import { getLook } from './looks';
import { readData } from './store';

const KNOWN_THICKNESS = new Set(['idalgo', 'granitea']);

export type TilesFile = { generated?: string; collections: Collection[] };

const memo = new WeakMap<object, Collection[]>();

const inStock = (p: Product) => (p.stock ?? []).some((s) => s.m2 > 0 || s.pcs > 0);
const unique = (xs: string[]) => Array.from(new Set(xs.filter(Boolean)));
const byWidthDesc = (a: string, b: string) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0) || a.localeCompare(b, 'ru');

export function getCollections(): Collection[] {
  const raw = readData<TilesFile>('tiles');
  let list = memo.get(raw);
  if (!list) {
    list = (raw.collections ?? [])
      .filter((c) => !HIDDEN_BRANDS.has(c.brand))
      .map((c) => {
        const products = c.products.filter(inStock);
        return {
          ...c,
          products,
          sizes: unique(products.flatMap((p) => p.sizes)).sort(byWidthDesc),
          surfaces: unique(products.flatMap((p) => p.surfaces)).sort((a, b) => a.localeCompare(b, 'ru')),
          stockM2: Math.round(products.reduce((n, p) => n + (p.stock ?? []).reduce((k, s) => k + s.m2, 0), 0) * 10) / 10,
          description: c.description || getLook(c.look)?.description || '',
          thickness: KNOWN_THICKNESS.has(c.brand) ? c.thickness || '10 мм' : '',
        };
      })
      .filter((c) => c.products.length > 0);
    memo.set(raw, list);
  }
  return list;
}
