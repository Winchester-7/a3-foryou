import raw from './catalog.json';

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://legendary-cobbler-91081f.netlify.app';
export const WHATSAPP = 'https://wa.me/996706010321';

export interface TileSize { label: string; w: number; h: number }
export interface Decor { id: string; name: string; article: string | null; texture: string; image: string; href: string }
export interface TileCollection {
  slug: string;
  name: string;
  brand: string;
  look: string;
  surfaces: string[];
  sizes: TileSize[];
  decors: Decor[];
}
export interface Swatch { name: string; hex: string }
export interface DoorModel { slug: string; name: string; style: string; glass: boolean; colors: Swatch[]; image: string; href: string }
export interface SofaModel { slug: string; name: string; kind: 'Диван' | 'Кресло'; sizes: string[]; fabrics: Swatch[]; image: string; href: string }

const data = raw as unknown as {
  tiles: TileCollection[];
  lookLabels: Record<string, string>;
  doors: DoorModel[];
  sofas: SofaModel[];
};

export const tileCollections = data.tiles;
export const lookLabels = data.lookLabels;
export const doorModels = data.doors;
export const sofaModels = data.sofas;

const decorIndex = new Map<string, { decor: Decor; collection: TileCollection }>();
for (const c of tileCollections) for (const d of c.decors) decorIndex.set(d.id, { decor: d, collection: c });

export function findDecor(id: string) {
  return decorIndex.get(id) ?? decorIndex.values().next().value!;
}
export const findDoor = (slug?: string) => doorModels.find((d) => d.slug === slug) ?? doorModels[0];
export const findSofa = (slug?: string) => sofaModels.find((s) => s.slug === slug) ?? sofaModels[0];

/** "200 × 95" (cm) → metres */
export function sofaDims(size: string): { w: number; d: number } {
  const [w, d] = size.split('×').map((n) => parseInt(n, 10) / 100);
  return { w: w || 2, d: d || 0.95 };
}

/** Roughness per surface finish — polished reflects, matte diffuses. */
export const FINISH_ROUGHNESS: Record<string, number> = {
  Полированная: 0.08,
  Лаппатированная: 0.28,
  Матовая: 0.62,
  Структурная: 0.78,
  Рельефная: 0.82,
};
