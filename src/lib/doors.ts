/**
 * Door catalogue — loaded from src/data/doors.json (interior and entrance
 * doors). The file is edited by the Telegram bot as well as by the importer.
 * @author Erbol king
 */
import data from '@/data/doors.json';

export interface DoorColor {
  name: string;
  hex: string;
  image?: string;
}

export interface DoorModel {
  slug: string;
  name: string;
  /** series / collection the model belongs to */
  brand: string;
  style: string;
  types: string[]; // ДГ — глухая / ДО — со стеклом
  description: string;
  colors: DoorColor[];
  sizes: string[];
  specs: [string, string][];
  hero: string;
  image: string;
  gallery: string[];
  kind?: 'interior' | 'entrance';
  source?: string;
}

export const doorModels: DoorModel[] = data as unknown as DoorModel[];

export function getDoor(slug: string): DoorModel | undefined {
  return doorModels.find((d) => d.slug === slug);
}

export const doorKindLabel = (d: DoorModel) => (d.kind === 'entrance' ? 'Входная' : 'Межкомнатная');
