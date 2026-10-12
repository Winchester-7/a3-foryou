/**
 * Door catalogue — read from the data store (doors.json), edited in the admin panel.
 * @author Erbol king
 */
import { readData } from './store';

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

export function getDoors(): DoorModel[] {
  return readData<DoorModel[]>('doors');
}

export function getDoor(slug: string): DoorModel | undefined {
  return getDoors().find((d) => d.slug === slug);
}

export const doorKindLabel = (d: DoorModel) => (d.kind === 'entrance' ? 'Входная' : 'Межкомнатная');
