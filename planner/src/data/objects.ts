/** @author Erbol king */
import { doorDims, doorModels, sofaModels, sofaDims, tileCollections, type Swatch } from './catalog';

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
  /** selectable widths, metres (the model is stretched along its width) */
  widths?: number[];
  /** depth follows the width proportionally (rugs, tables) */
  keepRatio?: boolean;
  icon: string;
}

const FRONTS: Swatch[] = [
  { name: 'Белый', hex: '#f1efeb' },
  { name: 'Дуб', hex: '#b08a62' },
  { name: 'Орех', hex: '#6b4a2f' },
  { name: 'Графит', hex: '#45474a' },
  { name: 'Чёрный', hex: '#1f1f1f' },
  { name: 'Шалфей', hex: '#9aa593' },
  { name: 'Кашемир', hex: '#d8ccb9' },
  { name: 'Тёмно-синий', hex: '#2f3b52' },
];
const TEXTILE: Swatch[] = [
  { name: 'Лён', hex: '#e6dfd3' },
  { name: 'Графит', hex: '#4c4d4f' },
  { name: 'Олива', hex: '#6f6b49' },
  { name: 'Терракота', hex: '#a45c43' },
  { name: 'Индиго', hex: '#3f4a63' },
  { name: 'Бордо', hex: '#6d2b33' },
  { name: 'Тауп', hex: '#9a8f80' },
];

export const OBJECTS: Record<ObjKind, ObjDef> = {
  door: { kind: 'door', label: 'Дверь', group: 'Двери', w: 0.9, d: 0.1, wall: true, icon: 'door' },
  bathtub: { kind: 'bathtub', label: 'Ванна', group: 'Ванная', w: 1.7, d: 0.75, wall: true, widths: [1.5, 1.6, 1.7, 1.8], icon: 'bath' },
  shower: { kind: 'shower', label: 'Душевая', group: 'Ванная', w: 0.9, d: 0.9, wall: true, widths: [0.8, 0.9, 1.0, 1.2], keepRatio: true, icon: 'shower' },
  vanity: { kind: 'vanity', label: 'Тумба с раковиной', group: 'Ванная', w: 0.8, d: 0.48, wall: true, colors: FRONTS, widths: [0.6, 0.8, 1.0, 1.2], icon: 'vanity' },
  toilet: { kind: 'toilet', label: 'Унитаз', group: 'Ванная', w: 0.4, d: 0.62, wall: true, icon: 'toilet' },
  kitchen: { kind: 'kitchen', label: 'Кухонный гарнитур', group: 'Кухня', w: 2.4, d: 0.62, wall: true, colors: FRONTS, widths: [1.8, 2.4, 3.0, 3.6], icon: 'kitchen' },
  island: { kind: 'island', label: 'Остров', group: 'Кухня', w: 1.6, d: 0.9, wall: false, colors: FRONTS, widths: [1.2, 1.6, 2.0], icon: 'island' },
  table: { kind: 'table', label: 'Стол со стульями', group: 'Кухня', w: 1.4, d: 0.8, wall: false, widths: [1.2, 1.4, 1.8], keepRatio: true, icon: 'table' },
  sofa: { kind: 'sofa', label: 'Диван Delavega', group: 'Мебель', w: 2.0, d: 0.95, wall: false, icon: 'sofa' },
  bed: { kind: 'bed', label: 'Кровать', group: 'Мебель', w: 1.7, d: 2.15, wall: true, colors: TEXTILE, widths: [1.4, 1.6, 1.7, 1.8, 2.0], icon: 'bed' },
  wardrobe: { kind: 'wardrobe', label: 'Шкаф', group: 'Мебель', w: 1.6, d: 0.6, wall: true, colors: FRONTS, widths: [1.0, 1.6, 2.0, 2.4], icon: 'wardrobe' },
  tv: { kind: 'tv', label: 'ТВ-зона', group: 'Мебель', w: 1.8, d: 0.42, wall: true, colors: FRONTS, widths: [1.2, 1.8, 2.2], icon: 'tv' },
  plant: { kind: 'plant', label: 'Растение', group: 'Декор', w: 0.5, d: 0.5, wall: false, icon: 'plant' },
  rug: { kind: 'rug', label: 'Ковёр', group: 'Декор', w: 2.0, d: 1.4, wall: false, colors: TEXTILE, widths: [1.4, 2.0, 2.4, 3.0], keepRatio: true, icon: 'rug' },
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
  /** sofa size label ("230 × 95", cm) or door size label ("800 × 2000", mm) */
  size?: string;
  /** chosen width for resizable furniture, metres */
  w?: number;
}

/** Real footprint (sofas depend on the chosen model size). */
export function footprint(o: PlacedObject): { w: number; d: number } {
  if (o.kind === 'sofa') {
    const m = sofaModels.find((s) => s.slug === o.ref) ?? sofaModels[0];
    return sofaDims(o.size ?? m.sizes[0]);
  }
  const def = OBJECTS[o.kind];
  if (o.kind === 'door') {
    const m = doorModels.find((d) => d.slug === o.ref) ?? doorModels[0];
    return { w: doorDims(o.size ?? m?.sizes?.[0] ?? '800 × 2000').w + 0.14, d: def.d };
  }
  const k = o.w && def.w ? o.w / def.w : 1;
  return { w: o.w ?? def.w, d: def.keepRatio ? def.d * k : def.d };
}

/** Scale to apply to the procedural model so it matches the chosen size. */
export function modelScale(o: PlacedObject): [number, number, number] {
  const def = OBJECTS[o.kind];
  if (o.kind === 'door') {
    const m = doorModels.find((d) => d.slug === o.ref) ?? doorModels[0];
    const { w, h } = doorDims(o.size ?? m?.sizes?.[0] ?? '800 × 2000');
    return [w / 0.8, h / 2.0, 1];
  }
  if (o.kind === 'sofa' || !o.w) return [1, 1, 1];
  const k = o.w / def.w;
  return [k, 1, def.keepRatio ? k : 1];
}

export interface SizeOption {
  id: string;
  label: string;
  patch: Partial<PlacedObject>;
  active: boolean;
}

/** Everything the panel needs to let the client resize / recolour / re-model an object. */
export function objectOptions(o: PlacedObject): {
  title: string;
  sizes: SizeOption[];
  colors: Swatch[];
  href: string | null;
  unit: string;
} {
  const def = OBJECTS[o.kind];
  if (o.kind === 'door') {
    const m = doorModels.find((d) => d.slug === o.ref) ?? doorModels[0];
    const cur = o.size ?? m?.sizes?.[0];
    return {
      title: `${m?.kind === 'entrance' ? 'Входная' : 'Межкомнатная'} дверь ${m?.name ?? ''}`.trim(),
      sizes: (m?.sizes ?? []).map((s) => ({ id: s, label: s, patch: { size: s }, active: s === cur })),
      colors: m?.colors ?? [],
      href: m?.href ?? null,
      unit: 'мм',
    };
  }
  if (o.kind === 'sofa') {
    const m = sofaModels.find((s) => s.slug === o.ref) ?? sofaModels[0];
    const cur = o.size ?? m.sizes[0];
    return {
      title: `${m.kind} ${m.name}`,
      sizes: m.sizes.map((s) => ({ id: s, label: s, patch: { size: s }, active: s === cur })),
      colors: m.fabrics,
      href: m.href,
      unit: 'см',
    };
  }
  const cur = o.w ?? def.w;
  return {
    title: def.label,
    sizes: (def.widths ?? []).map((w) => ({
      id: String(w),
      label: `${w.toLocaleString('ru-RU')} м`,
      patch: { w },
      active: Math.abs(w - cur) < 0.001,
    })),
    colors: def.colors ?? [],
    href: null,
    unit: 'м',
  };
}

export function defaultsFor(kind: ObjKind): Partial<PlacedObject> {
  if (kind === 'door') {
    const d = doorModels[0];
    return { ref: d.slug, size: d.sizes?.[0], color: d.colors[0]?.hex, colorName: d.colors[0]?.name };
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

/** First decor of the first look that has anything in stock — keeps presets valid when the catalogue changes. */
function firstDecor(looks: string[], n = 0): string {
  for (const look of looks) {
    const list = tileCollections.filter((c) => c.look === look).flatMap((c) => c.decors);
    if (list.length) return list[Math.min(n, list.length - 1)].id;
  }
  return tileCollections[0]?.decors[0]?.id ?? '';
}

export const ROOM_PRESETS: RoomPreset[] = [
  { type: 'bath', title: 'Ванная', hint: 'Пол и стены до потолка', length: 2.6, width: 1.9, height: 2.6, floorDecor: firstDecor(['stone', 'concrete', 'marble']), wallDecor: firstDecor(['marble', 'stone'], 1), wallMode: 'full' },
  { type: 'kitchen', title: 'Кухня', hint: 'Пол и фартук', length: 4, width: 3.2, height: 2.7, floorDecor: firstDecor(['concrete', 'stone'], 1), wallDecor: firstDecor(['marble', 'stone']), wallMode: 'panel' },
  { type: 'living', title: 'Гостиная', hint: 'Крупный формат на пол', length: 5.5, width: 4.2, height: 2.8, floorDecor: firstDecor(['marble', 'stone']), wallDecor: firstDecor(['concrete', 'stone'], 2), wallMode: 'none' },
  { type: 'bedroom', title: 'Спальня', hint: 'Тёплый пол под дерево', length: 4.2, width: 3.6, height: 2.7, floorDecor: firstDecor(['wood', 'stone']), wallDecor: firstDecor(['concrete', 'stone'], 3), wallMode: 'none' },
  { type: 'hall', title: 'Прихожая', hint: 'Износостойкий пол', length: 3, width: 1.8, height: 2.7, floorDecor: firstDecor(['technical', 'concrete', 'stone'], 2), wallDecor: firstDecor(['concrete', 'stone']), wallMode: 'none' },
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
