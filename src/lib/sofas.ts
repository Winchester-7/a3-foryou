/**
 * Sofas and armchairs — loaded from src/data/sofas.json, which the Telegram
 * bot can edit (add / remove models).
 * @author Erbol king
 */
import data from '@/data/sofas.json';

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

export const sofaModels: SofaModel[] = data as unknown as SofaModel[];

export function getSofa(slug: string): SofaModel | undefined {
  return sofaModels.find((s) => s.slug === slug);
}
