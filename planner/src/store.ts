/** @author Erbol king */
import { create } from 'zustand';
import { findDecor } from './data/catalog';
import {
  OBJECTS,
  ROOM_PRESETS,
  defaultsFor,
  footprint,
  newId,
  presetObjects,
  type ObjKind,
  type PlacedObject,
  type RoomType,
} from './data/objects';
import type { Grout, Layout } from './three/tileOptions';

export interface Room {
  type: RoomType;
  /** along X, metres */
  length: number;
  /** along Z, metres */
  width: number;
  height: number;
}

export interface Surface {
  decorId: string;
  size: string; // tile format label, e.g. "1200×600"
  layout: Layout;
  grout: Grout;
  finish: string;
}

/** Where the tiled zone of a partly tiled floor starts. */
export type FloorFrom = 'back' | 'front' | 'left' | 'right';
export interface Floor extends Surface {
  /** share of the floor area that is tiled, 0.1–1 */
  coverage: number;
  from: FloorFrom;
  /** colour of the untiled part (screed) */
  base: string;
}

/** full wall, half the height, a custom height ("panel") or nothing. */
export type WallMode = 'full' | 'half' | 'panel' | 'none';
export interface Walls extends Surface {
  mode: WallMode;
  panelHeight: number;
  paint: string;
  /** which of the four walls are tiled: back, right, front, left */
  sides: boolean[];
  /** share of each wall's width that is tiled, 0.1–1 (centred) */
  span: number;
}

export type Tab = 'floor' | 'walls' | 'objects' | 'estimate';
export type View = '3d' | 'top';

interface Snapshot {
  room: Room;
  floor: Floor;
  walls: Walls;
  objects: PlacedObject[];
}

interface State extends Snapshot {
  step: 'setup' | 'editor';
  /** a project from a previous visit was restored */
  hasSaved: boolean;
  tab: Tab;
  view: View;
  selectedId: string | null;
  dragging: boolean;
  history: Snapshot[];

  start: (room: Room) => void;
  backToSetup: () => void;
  resize: (patch: Partial<Room>) => void;
  setFloor: (patch: Partial<Floor>) => void;
  setWalls: (patch: Partial<Walls>) => void;
  setTab: (t: Tab) => void;
  setView: (v: View) => void;
  select: (id: string | null) => void;
  setDragging: (d: boolean) => void;
  addObject: (kind: ObjKind, extra?: Partial<PlacedObject>) => void;
  updateObject: (id: string, patch: Partial<PlacedObject>, record?: boolean) => void;
  moveObject: (id: string, x: number, z: number) => void;
  rotateObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  removeObject: (id: string) => void;
  undo: () => void;
  load: (s: Snapshot) => void;
}

/** First decor + a sensible format for a surface. */
export function surfaceFor(decorId: string, wall = false): Surface {
  const { collection } = findDecor(decorId);
  // walls look best with the largest format, floors with the collection default
  const size = wall ? [...collection.sizes].sort((a, b) => b.w * b.h - a.w * a.h)[0] : collection.sizes[0];
  return {
    decorId,
    size: size.label,
    layout: 'straight',
    grout: collection.look === 'marble' ? 'light' : 'mid',
    finish: collection.surfaces[0] ?? 'Матовая',
  };
}

export const floorFor = (decorId: string): Floor => ({
  ...surfaceFor(decorId),
  coverage: 1,
  from: 'back',
  base: '#d9d4cc',
});

/** Height of the tiled band on a wall, metres. */
export function wallTileHeight(walls: Walls, room: Room): { base: number; height: number } {
  const base = walls.mode === 'panel' && room.type === 'kitchen' ? 0.88 : 0;
  if (walls.mode === 'full') return { base: 0, height: room.height };
  if (walls.mode === 'half') return { base: 0, height: room.height / 2 };
  if (walls.mode === 'panel') return { base, height: Math.min(walls.panelHeight, room.height - base) };
  return { base: 0, height: 0 };
}

/** Older saved / shared projects miss the newer fields — fill them in. */
function normalize<T extends Partial<Snapshot>>(s: T): T {
  const floor = s.floor as Partial<Floor> | undefined;
  const walls = s.walls as Partial<Walls> | undefined;
  return {
    ...s,
    floor: floor && { coverage: 1, from: 'back', base: '#d9d4cc', ...floor },
    walls: walls && { sides: [true, true, true, true], span: 1, ...walls },
  } as T;
}

const WALL_EPS = 0.01;

/** Keeps an object inside the room; wall-mounted items snap their back to the nearest wall. */
export function placeObject(o: PlacedObject, room: Room, x: number, z: number): { x: number; z: number; rot: number } {
  const def = OBJECTS[o.kind];
  const { w, d } = footprint(o);
  const L = room.length / 2;
  const W = room.width / 2;
  if (def.wall) {
    // distance to each wall: back(-z), right(+x), front(+z), left(-x)
    const dist = [z + W, L - x, W - z, x + L];
    const wall = dist.indexOf(Math.min(...dist));
    const rot = [0, -Math.PI / 2, Math.PI, Math.PI / 2][wall];
    if (wall === 0 || wall === 2) {
      const cx = Math.max(-L + w / 2, Math.min(L - w / 2, x));
      return { x: cx, z: wall === 0 ? -W + d / 2 + WALL_EPS : W - d / 2 - WALL_EPS, rot };
    }
    const cz = Math.max(-W + w / 2, Math.min(W - w / 2, z));
    return { x: wall === 1 ? L - d / 2 - WALL_EPS : -L + d / 2 + WALL_EPS, z: cz, rot };
  }
  const quarter = Math.round(o.rot / (Math.PI / 2)) % 2 !== 0;
  const hw = (quarter ? d : w) / 2;
  const hd = (quarter ? w : d) / 2;
  return {
    x: Math.max(-L + hw, Math.min(L - hw, x)),
    z: Math.max(-W + hd, Math.min(W - hd, z)),
    rot: o.rot,
  };
}

const STORAGE_KEY = 'a3-planner-v1';

function initial(): Snapshot & { step: 'setup' | 'editor'; hasSaved: boolean } {
  // 1) shared link, 2) last session, 3) fresh
  try {
    const hash = location.hash.startsWith('#p=') ? location.hash.slice(3) : '';
    if (hash) {
      const json = decodeURIComponent(escape(atob(hash.replace(/-/g, '+').replace(/_/g, '/'))));
      return { ...normalize(JSON.parse(json) as Snapshot), step: 'editor', hasSaved: false };
    }
  } catch {
    /* broken link — fall through */
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...normalize(JSON.parse(saved) as Snapshot), step: 'setup', hasSaved: true };
  } catch {
    /* storage unavailable */
  }
  const p = ROOM_PRESETS[0];
  const room: Room = { type: p.type, length: p.length, width: p.width, height: p.height };
  return {
    step: 'setup',
    hasSaved: false,
    room,
    floor: floorFor(p.floorDecor),
    walls: { ...surfaceFor(p.wallDecor, true), mode: p.wallMode, panelHeight: 1.2, paint: '#ece8e1', sides: [true, true, true, true], span: 1 },
    objects: presetObjects(p.type, p.length, p.width),
  };
}

export function encodeShare(s: Snapshot): string {
  const json = JSON.stringify({ room: s.room, floor: s.floor, walls: s.walls, objects: s.objects });
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const snap = (s: Snapshot): Snapshot => ({ room: s.room, floor: s.floor, walls: s.walls, objects: s.objects });

export const usePlanner = create<State>((set, get) => {
  const record = () => set((s) => ({ history: [...s.history.slice(-40), snap(s)] }));

  return {
    ...initial(),
    tab: 'floor',
    view: '3d',
    selectedId: null,
    dragging: false,
    history: [],

    start: (room) => {
      const preset = ROOM_PRESETS.find((p) => p.type === room.type) ?? ROOM_PRESETS[0];
      const prev = get();
      const sameType = prev.room.type === room.type && prev.objects.length > 0;
      set({
        step: 'editor',
        room,
        floor: sameType ? prev.floor : floorFor(preset.floorDecor),
        walls: sameType
          ? prev.walls
          : {
              ...surfaceFor(preset.wallDecor, true),
              mode: preset.wallMode,
              panelHeight: room.type === 'kitchen' ? 0.6 : 1.2,
              paint: '#ece8e1',
              sides: [true, true, true, true],
              span: 1,
            },
        objects: sameType
          ? prev.objects.map((o) => ({ ...o, ...placeObject(o, room, o.x, o.z) }))
          : presetObjects(room.type, room.length, room.width),
        selectedId: null,
        tab: 'floor',
        history: [],
      });
    },
    backToSetup: () => set({ step: 'setup', selectedId: null }),
    resize: (patch) => {
      record();
      set((s) => {
        const room = { ...s.room, ...patch };
        return { room, objects: s.objects.map((o) => ({ ...o, ...placeObject(o, room, o.x, o.z) })) };
      });
    },
    setFloor: (patch) => {
      record();
      set((s) => ({ floor: { ...s.floor, ...patch } }));
    },
    setWalls: (patch) => {
      record();
      set((s) => ({ walls: { ...s.walls, ...patch } }));
    },
    setTab: (tab) => set({ tab }),
    setView: (view) => set({ view }),
    select: (selectedId) => set({ selectedId }),
    setDragging: (dragging) => set({ dragging }),

    addObject: (kind, extra = {}) => {
      record();
      set((s) => {
        const base: PlacedObject = { id: newId(), kind, x: 0, z: 0, rot: 0, ...defaultsFor(kind), ...extra };
        // drop new things a little in front of the camera-facing half, snapped/clamped
        const placed = { ...base, ...placeObject(base, s.room, 0, OBJECTS[kind].wall ? -s.room.width : 0) };
        return { objects: [...s.objects, placed], selectedId: placed.id };
      });
    },
    updateObject: (id, patch, rec = true) => {
      if (rec) record();
      set((s) => ({
        objects: s.objects.map((o) => {
          if (o.id !== id) return o;
          const next = { ...o, ...patch };
          return { ...next, ...placeObject(next, s.room, next.x, next.z) };
        }),
      }));
    },
    moveObject: (id, x, z) =>
      set((s) => ({ objects: s.objects.map((o) => (o.id === id ? { ...o, ...placeObject(o, s.room, x, z) } : o)) })),
    rotateObject: (id) => {
      record();
      set((s) => ({
        objects: s.objects.map((o) => {
          if (o.id !== id || OBJECTS[o.kind].wall) return o;
          const next = { ...o, rot: (o.rot + Math.PI / 2) % (Math.PI * 2) };
          return { ...next, ...placeObject(next, s.room, next.x, next.z) };
        }),
      }));
    },
    duplicateObject: (id) => {
      record();
      set((s) => {
        const src = s.objects.find((o) => o.id === id);
        if (!src) return {};
        const copy = { ...src, id: newId() };
        const placed = { ...copy, ...placeObject(copy, s.room, src.x + 0.4, src.z + 0.4) };
        return { objects: [...s.objects, placed], selectedId: placed.id };
      });
    },
    removeObject: (id) => {
      record();
      set((s) => ({ objects: s.objects.filter((o) => o.id !== id), selectedId: null }));
    },
    undo: () =>
      set((s) => {
        const prev = s.history[s.history.length - 1];
        if (!prev) return {};
        return { ...prev, history: s.history.slice(0, -1), selectedId: null };
      }),
    load: (snapshot) => set({ ...snapshot, step: 'editor', selectedId: null, history: [] }),
  };
});

// autosave the project so a refresh never loses work
let saveTimer: number | undefined;
usePlanner.subscribe((s) => {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap(s)));
    } catch {
      /* ignore */
    }
  }, 400);
});
