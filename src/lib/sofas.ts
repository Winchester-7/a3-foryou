/**
 * Sofas and armchairs — read from the data store (sofas.json), edited in the admin panel.
 * @author Erbol king
 */
import { readData } from './store';

export interface FabricColor {
  name: string;
  hex: string;
}

export interface SofaModel {
  slug: string;
  name: string;
  brand: string;
  kind: 'Диван' | 'Кресло';
  description: string;
  frame: string;
  legs: string;
  filler: string;
  sizes: string[];
  fabrics: FabricColor[];
  custom: boolean;
  specs: [string, string][];
  hero: string;
  image: string;
  gallery: string[];
}

export function getSofas(): SofaModel[] {
  return readData<SofaModel[]>('sofas');
}

export function getSofa(slug: string): SofaModel | undefined {
  return getSofas().find((s) => s.slug === slug);
}
