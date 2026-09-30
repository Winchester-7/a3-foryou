import { doorModels, sofaModels, sofaDims, type Swatch } from './catalog';

export type ObjKind =
  | 'door'
  | 'bathtub'
  | 'shower'
  | 'vanity'
  | 'toilet'
  | 'kitchen'
  | 'island'
  | 'sofa'
  | 'bed'
  | 'table'
  | 'wardrobe'
  | 'tv'
  | 'plant'
  | 'rug';

export interface ObjDef {
  kind: ObjKind;
  label: string;
  group: 'Двери' | 'Ванная' | 'Кухня' | 'Мебель' | 'Декор';
  /** footprint in metres: w along the object's local x, d along local z (front faces +z) */
  w: number;
  d: number;
  /** backs onto the nearest wall when moved */
  wall: boolean;
  colors?: Swatch[];
  icon: string;
}

const FRONTS: Swatch[] = [
  { name: 'Белый', hex: '#f1efeb' },
  { name: 'Дуб', hex: '#b08a62' },
  { name: 'Графит', hex: '#45474a' },
  { name: 'Шалфей', hex: '#9aa593' },
  { name: 'Кашемир', hex: '#d8ccb9' },
];
const TEXTILE: Swatch[] = [
  { name: 'Лён', hex: '#e6dfd3' },
  { name: 'Графит', hex: '#4c4d4f' },
  { name: 'Олива', hex: '#6f6b49' },
  { name: 'Терракота', hex: '#a45c43' },
  { name: 'Индиго', hex: '#3f4a63' },
];

export const OBJECTS: Record<ObjKind, ObjDef> = {
  door: { kind: 'door', label: 'Дверь Diford', group: 'Двери', w: 0.9, d: 0.1, wall: true, icon: 'door' },
  bathtub: { kind: 'bathtub', label: 'Ванна', group: 'Ванная', w: 1.7, d: 0.75, wall: true, icon: 'bath' },
  shower: { kind: 'shower', label: 'Душевая', group: 'Ванная', w: 0.9, d: 0.9, wall: true, icon: 'shower' },
  vanity: { kind: 'vanity', label: 'Тумба с раковиной', group: 'Ванная', w: 0.8, d: 0.48, wall: true, colors: FRONTS, icon: 'vanity' },
  toilet: { kind: 'toilet', label: 'Унитаз', group: 'Ванная', w: 0.4, d: 0.62, wall: true, icon: 'toilet' },
  kitchen: { kind: 'kitchen', label: 'Кухонный гарнитур', group: 'Кухня', w: 2.4, d: 0.62, wall: true, colors: FRONTS, icon: 'kitchen' },
  island: { kind: 'island', label: 'Остров', group: 'Кухня', w: 1.6, d: 0.9, wall: false, colors: FRONTS, icon: 'island' },
  table: { kind: 'table', label: 'Стол со стульями', group: 'Кухня', w: 1.4, d: 0.8, wall: false, icon: 'table' },
  sofa: { kind: 'sofa', label: 'Диван Delavega', group: 'Мебель', w: 2.0, d: 0.95, wall: false, icon: 'sofa' },
  bed: { kind: 'bed', label: 'Кровать', group: 'Мебель', w: 1.7, d: 2.15, wall: true, colors: TEXTILE, icon: 'bed' },
  wardrobe: { kind: 'wardrobe', label: 'Шкаф', group: 'Мебель', w: 1.6, d: 0.6, wall: true, colors: FRONTS, icon: 'wardrobe' },
  tv: { kind: 'tv', label: 'ТВ-зона', group: 'Мебель', w: 1.8, d: 0.42, wall: true, colors: FRONTS, icon: 'tv' },
  plant: { kind: 'plant', label: 'Растение', group: 'Декор', w: 0.5, d: 0.5, wall: false, icon: 'plant' },
  rug: { kind: 'rug', label: 'Ковёр', group: 'Декор', w: 2.0, d: 1.4, wall: false, colors: TEXTILE, icon: 'rug' },
};

export interface PlacedObject {
  id: string;
  kind: ObjKind;
  x: number;
  z: number;
  /** radians, always a multiple of π/2 */
  rot: number;
  color?: string;
  colorName?: string;
  /** door / sofa model slug */
  ref?: string;
  /** sofa size label, e.g. "230 × 95" */
  size?: string;
}

/** Real footprint (sofas depend on the chosen model size). */
export function footprint(o: PlacedObject): { w: number; d: number } {
  if (o.kind === 'sofa') {
    const m = sofaModels.find((s) => s.slug === o.ref) ?? sofaModels[0];
    return sofaDims(o.size ?? m.sizes[0]);
  }
  const def = OBJECTS[o.kind];
  return { w: def.w, d: def.d };
}

export function defaultsFor(kind: ObjKind): Partial<PlacedObject> {
  if (kind === 'door') {
    const d = doorModels[0];
    return { ref: d.slug, color: d.colors[0].hex, colorName: d.colors[0].name };
  }
  if (kind === 'sofa') {
    const s = sofaModels.find((m) => m.kind === 'Диван') ?? sofaModels[0];
    return { ref: s.slug, size: s.sizes[0], color: s.fabrics[0].hex, colorName: s.fabrics[0].name };
  }
  const c = OBJECTS[kind].colors?.[0];
  return c ? { color: c.hex, colorName: c.name } : {};
}

export type RoomType = 'bath' | 'kitchen' | 'living' | 'bedroom' | 'hall';

export interface RoomPreset {
  type: RoomType;
  title: string;
  hint: string;
  length: number;
  width: number;
  height: number;
  floorDecor: string;
  wallDecor: string;
  wallMode: 'full' | 'panel' | 'none';
}

export const ROOM_PRESETS: RoomPreset[] = [
  { type: 'bath', title: 'Ванная', hint: 'Пол и стены до потолка', length: 2.6, width: 1.9, height: 2.6, floorDecor: 'karatash-1', wallDecor: 'lusso-4', wallMode: 'full' },
  { type: 'kitchen', title: 'Кухня', hint: 'Пол и фартук', length: 4, width: 3.2, height: 2.7, floorDecor: 'cement-1', wallDecor: 'calacatta-1', wallMode: 'panel' },
  { type: 'living', title: 'Гостиная', hint: 'Крупный формат на пол', length: 5.5, width: 4.2, height: 2.8, floorDecor: 'lusso-1', wallDecor: 'neiva-1', wallMode: 'none' },
  { type: 'bedroom', title: 'Спальня', hint: 'Тёплый пол под дерево', length: 4.2, width: 3.6, height: 2.7, floorDecor: 'wood-classic-2', wallDecor: 'neiva-1', wallMode: 'none' },
  { type: 'hall', title: 'Прихожая', hint: 'Износостойкий пол', length: 3, width: 1.8, height: 2.7, floorDecor: 'armor-1', wallDecor: 'concepta-1', wallMode: 'none' },
];

let seq = 0;
export const newId = () => `o${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Sensible starting furniture so the first render already looks like a room. */
export function presetObjects(type: RoomType, L: number, W: number): PlacedObject[] {
  const mk = (kind: ObjKind, x: number, z: number, rot: number, extra: Partial<PlacedObject> = {}): PlacedObject => ({
    id: newId(),
    kind,
    x,
    z,
    rot,
    ...defaultsFor(kind),
    ...extra,
  });
  const back = -W / 2;
  const front = W / 2;
  const right = L / 2;
  const left = -L / 2;
  switch (type) {
    case 'bath':
      return [
        mk('bathtub', left + 0.85 + 0.02, back + 0.375 + 0.02, 0),
        mk('vanity', right - 0.24 - 0.02, back + 0.6, -Math.PI / 2),
        mk('toilet', right - 0.31 - 0.02, Math.min(front - 0.6, back + 1.45), -Math.PI / 2),
        mk('door', left + Math.min(0.75, L / 3), front - 0.05, Math.PI),
      ];
    case 'kitchen':
      return [
        mk('kitchen', left + 1.2 + 0.1, back + 0.31 + 0.01, 0),
        mk('table', L * 0.12, W * 0.18, 0),
        mk('plant', right - 0.4, back + 0.4, 0),
        mk('door', right - 0.7, front - 0.05, Math.PI),
      ];
    case 'living':
      return [
        mk('sofa', 0, front - 1.2, Math.PI),
        mk('rug', 0, 0.2, 0, { color: '#e6dfd3', colorName: 'Лён' }),
        mk('tv', 0, back + 0.21 + 0.01, 0),
        mk('plant', right - 0.45, back + 0.45, 0),
        mk('door', left + 0.8, front - 0.05, Math.PI),
      ];
    case 'bedroom':
      return [
        mk('bed', 0, back + 1.075 + 0.01, 0),
        mk('wardrobe', right - 0.3 - 0.01, front - 1.2, -Math.PI / 2),
        mk('rug', 0, back + 1.6, 0, { color: '#d8ccb9', colorName: 'Кашемир' }),
        mk('door', left + 0.7, front - 0.05, Math.PI),
      ];
    case 'hall':
      return [
        mk('wardrobe', left + 0.8 + 0.1, back + 0.3 + 0.01, 0),
        mk('door', right - 0.65, front - 0.05, Math.PI),
        mk('door', left + 0.6, front - 0.05, Math.PI),
      ];
  }
}
