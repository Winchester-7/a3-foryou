/**
 * Promotions — read from the data store (promotions.json), edited in the admin panel.
 * @author Erbol king
 */
import { readData } from './store';

export interface Promotion {
  slug: string;
  title: string;
  offer: string;
  description: string;
  until: string;
  imageSeed: string;
  accent?: boolean;
}

export function getPromotions(): Promotion[] {
  return readData<Promotion[]>('promotions');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
