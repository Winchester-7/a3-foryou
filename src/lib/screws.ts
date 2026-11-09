/**
 * Screws, dowels and nails — read from the data store (screws.json), edited in the admin panel.
 * @author Erbol king
 */
import { readData } from './store';

export interface ScrewItem {
  slug: string;
  name: string;
  /** group shown as a filter: Саморезы, Дюбели, Гвозди… */
  kind: string;
  description: string;
  /** price in som per unit; 0 = «по запросу» */
  price: number;
  /** unit the price is for: шт., уп., кг */
  unit: string;
  image: string;
  gallery: string[];
  specs: [string, string][];
}

export function getScrews(): ScrewItem[] {
  return readData<ScrewItem[]>('screws');
}

export function getScrew(slug: string): ScrewItem | undefined {
  return getScrews().find((s) => s.slug === slug);
}

/** «120 сом / уп.» or «Цена по запросу» */
export function screwPrice(s: Pick<ScrewItem, 'price' | 'unit'>): string {
  if (!(s.price > 0)) return 'Цена по запросу';
  return `${s.price.toLocaleString('ru-RU')} сом${s.unit ? ` / ${s.unit}` : ''}`;
}
