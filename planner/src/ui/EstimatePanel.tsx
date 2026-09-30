import { findDecor, findDoor, findSofa, SITE_URL, WHATSAPP } from '../data/catalog';
import type { PlacedObject } from '../data/objects';
import { encodeShare, usePlanner, type Room, type Surface, type Walls } from '../store';
import { Icon } from './icons';
import { fmt, plural } from './format';
import { Section } from './SurfacePanel';

const RESERVE = 1.1; // +10% for cutting and breakage
const DOOR_W = 0.8;
const DOOR_H = 2.0;

export interface TileCalc {
  surface: Surface;
  area: number;
  tiles: number;
  m2: number;
}

function calc(surface: Surface, area: number): TileCalc {
  const { collection } = findDecor(surface.decorId);
  const size = collection.sizes.find((s) => s.label === surface.size) ?? collection.sizes[0];
  const tileArea = size.w * size.h;
  const tiles = Math.ceil((area * RESERVE) / tileArea);
  return { surface, area, tiles, m2: Math.round(tiles * tileArea * 100) / 100 };
}

export function estimate(room: Room, floor: Surface, walls: Walls, objects: PlacedObject[]) {
  const floorCalc = calc(floor, room.length * room.width);
  let wallCalc: TileCalc | null = null;
  if (walls.mode !== 'none') {
    const base = walls.mode === 'panel' && room.type === 'kitchen' ? 0.88 : 0;
    const h = walls.mode === 'full' ? room.height : Math.min(walls.panelHeight, room.height - base);
    const doors = objects.filter((o) => o.kind === 'door').length;
    const doorOverlap = Math.max(0, Math.min(DOOR_H, base + h) - base);
    const area = Math.max(0, 2 * (room.length + room.width) * h - doors * DOOR_W * doorOverlap);
    wallCalc = calc(walls, area);
  }
  return { floorCalc, wallCalc };
}

/** Everything the client picked, grouped for the site cart / the message. */
export function projectItems() {
  const { room, floor, walls, objects } = usePlanner.getState();
  const { floorCalc, wallCalc } = estimate(room, floor, walls, objects);
  const items: { id: string; kind: 'tile' | 'door' | 'sofa'; title: string; details: string; image: string; href: string; qty: number; unit: 'м²' | 'шт.' }[] = [];

  const tile = (c: TileCalc, where: string) => {
    const { decor, collection } = findDecor(c.surface.decorId);
    const id = `tile:${decor.href.split('/').pop()}`;
    const qty = Math.ceil(c.m2);
    const existing = items.find((i) => i.id === id);
    if (existing) {
      existing.qty += qty;
      existing.details += `; ${where}`;
      return;
    }
    items.push({
      id,
      kind: 'tile',
      title: decor.name,
      details: `${collection.brand}, коллекция «${collection.name}» · ${c.surface.size} мм · ${where}`,
      image: decor.image,
      href: decor.href,
      qty,
      unit: 'м²',
    });
  };
  tile(floorCalc, 'пол');
  if (wallCalc) tile(wallCalc, 'стены');

  for (const o of objects) {
    if (o.kind !== 'door' && o.kind !== 'sofa') continue;
    const m = o.kind === 'door' ? findDoor(o.ref) : findSofa(o.ref);
    const variant = o.kind === 'sofa' ? `${o.colorName ?? ''} · ${o.size ?? ''} см` : o.colorName ?? '';
    const id = `${o.kind}:${m.href}|${variant}`;
    const hit = items.find((i) => i.id === id);
    if (hit) hit.qty += 1;
    else
      items.push({
        id,
        kind: o.kind,
        title: o.kind === 'door' ? `Дверь ${m.name}` : `${(m as ReturnType<typeof findSofa>).kind} ${m.name}`,
        details: `${o.kind === 'door' ? 'Diford' : 'Delavega'} · ${variant}`,
        image: m.image,
        href: m.href,
        qty: 1,
        unit: 'шт.',
      });
  }
  return { items, floorCalc, wallCalc };
}

export function shareUrl() {
  return `${location.origin}${location.pathname}#p=${encodeShare(usePlanner.getState())}`;
}

const b64url = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function EstimatePanel() {
  const room = usePlanner((s) => s.room);
  const floor = usePlanner((s) => s.floor);
  const walls = usePlanner((s) => s.walls);
  const objects = usePlanner((s) => s.objects);
  const { floorCalc, wallCalc } = estimate(room, floor, walls, objects);
  const doors = objects.filter((o) => o.kind === 'door').length;
  const sofas = objects.filter((o) => o.kind === 'sofa').length;

  const toCart = () => {
    const { items } = projectItems();
    location.href = `${SITE_URL}/?cart=${b64url(JSON.stringify(items))}`;
  };
  const toWhatsApp = () => {
    const { items } = projectItems();
    const lines = items.map((i, n) => `${n + 1}. ${i.title} — ${i.details}\n   ${i.qty} ${i.unit} · ${SITE_URL}${i.href}`);
    const text = [
      'Здравствуйте! Я собрал интерьер в 3D-планировщике A3 FOR YOU:',
      `Помещение: ${fmt(room.length, 2)} × ${fmt(room.width, 2)} м, потолок ${fmt(room.height, 2)} м (пол ${fmt(room.length * room.width)} м²)`,
      '',
      ...lines,
      '',
      `Мой проект в 3D: ${shareUrl()}`,
      '',
      'Подскажите, пожалуйста, наличие, стоимость и сроки доставки.',
    ].join('\n');
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <>
      <Section title="Расчёт керамогранита">
        <p className="mb-3 text-xs leading-relaxed text-ink-faint">С запасом 10% на подрезку и бой. Точную раскладку подготовит менеджер.</p>
        <CalcCard label="Пол" calc={floorCalc} />
        {wallCalc ? <CalcCard label={walls.mode === 'full' ? 'Стены' : room.type === 'kitchen' ? 'Фартук' : 'Панель'} calc={wallCalc} /> : null}
      </Section>
      {(doors > 0 || sofas > 0) && (
        <Section title="Двери и мебель">
          <ul className="space-y-1.5 text-sm text-ink">
            {doors > 0 && (
              <li className="flex justify-between">
                <span>Двери Diford</span>
                <span className="tabular-nums text-ink-soft">
                  {doors} {plural(doors, 'шт.', 'шт.', 'шт.')}
                </span>
              </li>
            )}
            {sofas > 0 && (
              <li className="flex justify-between">
                <span>Диваны и кресла Delavega</span>
                <span className="tabular-nums text-ink-soft">{sofas} шт.</span>
              </li>
            )}
          </ul>
        </Section>
      )}
      <div className="space-y-2.5 px-5 py-5">
        <button
          type="button"
          onClick={toCart}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-xs font-semibold uppercase tracking-wide2 text-paper transition-[background-color,transform] duration-150 ease-out-strong hover:bg-accent-ink active:scale-[0.98]"
        >
          Добавить всё в корзину на сайте
        </button>
        <button
          type="button"
          onClick={toWhatsApp}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-xs font-semibold uppercase tracking-wide2 text-white transition-[background-color,transform] duration-150 ease-out-strong hover:bg-[#1fb857] active:scale-[0.98]"
        >
          <Icon name="whatsapp" /> Отправить проект в WhatsApp
        </button>
        <p className="pt-1 text-center text-[11px] leading-relaxed text-ink-faint">
          В сообщение попадёт ссылка на ваш 3D-проект — менеджер откроет его в том же виде.
        </p>
      </div>
    </>
  );
}

function CalcCard({ label, calc: c }: { label: string; calc: TileCalc }) {
  const { decor } = findDecor(c.surface.decorId);
  return (
    <div className="mb-2 flex items-center gap-3 rounded-2xl bg-surface p-3">
      <span className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-black/5" style={{ backgroundImage: `url(${decor.texture})` }} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide2 text-ink-faint">
          {label} · {fmt(c.area)} м²
        </p>
        <p className="truncate text-sm font-semibold text-ink">{decor.name}</p>
        <p className="text-xs text-ink-soft">
          {c.surface.size} мм · {c.tiles} {plural(c.tiles, 'плитка', 'плитки', 'плиток')}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold tabular-nums text-ink">{fmt(c.m2, 2)}</p>
        <p className="text-[11px] text-ink-faint">м² к заказу</p>
      </div>
    </div>
  );
}
