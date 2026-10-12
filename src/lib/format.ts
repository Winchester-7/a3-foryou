/**
 * Small formatting helpers shared by server and client components.
 * @author Erbol king
 */
import type { Product } from './types';

/** Total m² of a product that is on the warehouse list. */
export function productStockM2(p: Product): number {
  return Math.round((p.stock ?? []).reduce((n, s) => n + s.m2, 0));
}

export function formatM2(n: number): string {
  return `${Math.round(n).toLocaleString('ru-RU')} м²`;
}

/** Prices are quoted on request — the source catalogs contain no retail pricing. */
export const PRICE_LABEL = 'Цена по запросу';
