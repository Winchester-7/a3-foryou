/** @author Erbol king */
import { useMemo, useState } from 'react';
import { findDecor, lookLabels, SITE_URL, tileCollections } from '../data/catalog';
import { surfaceKey, usePlanner, wallSurface, wallTileHeight, WALL_NAMES, type FloorFrom, type Surface, type WallMode, type WallTarget } from '../store';
import { GROUT_COLORS, GROUT_LABELS, LAYOUT_LABELS, type Grout, type Layout } from '../three/tileOptions';
import { fmt, plural } from './format';

export function Chips<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full border px-3 py-1.5 text-xs transition-[color,background-color,border-color,transform] duration-150 ease-out-strong active:scale-[0.96] ${
            value === v ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-0">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide2 text-ink-faint">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}


/** Red strip on top of a panel: tells the client which part of the room the controls change. */
function EditingBadge({ what }: { what: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-accent/20 bg-accent/10 px-5 py-2.5 text-[12px] font-semibold text-accent">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      Сейчас вы меняете: {what}
    </div>
  );
}

const LOOK_ORDER = ['marble', 'stone', 'wood', 'concrete', 'loft', 'technical', 'facade'];

function DecorGrid({ value, onPick }: { value: string; onPick: (decorId: string) => void }) {
  const current = findDecor(value);
  const [look, setLook] = useState<string>(current.collection.look);
  const looks = useMemo(() => LOOK_ORDER.filter((l) => tileCollections.some((c) => c.look === l)), []);
  const decors = useMemo(
    () => tileCollections.filter((c) => c.look === look).flatMap((c) => c.decors.map((d) => ({ d, c }))),
    [look],
  );

  return (
    <>
      <div className="-mx-5 mb-3 overflow-x-auto px-5 [scrollbar-width:none]">
        <div className="flex w-max gap-1.5">
          {looks.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLook(l)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors duration-150 ${
                look === l ? 'bg-accent text-paper' : 'bg-surface text-ink-soft hover:text-ink'
              }`}
            >
              {lookLabels[l] ?? l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {decors.map(({ d, c }) => {
          const active = d.id === value;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onPick(d.id)}
              title={`${d.name} · ${c.brand}`}
              className={`group relative overflow-hidden rounded-xl text-left ring-offset-2 transition-[box-shadow,transform] duration-150 ease-out-strong active:scale-[0.97] ${
                active ? 'ring-2 ring-accent' : 'ring-1 ring-line hover:ring-ink-faint'
              }`}
            >
              <span className="block aspect-[4/3] bg-surface bg-cover bg-center" style={{ backgroundImage: `url(${d.texture})` }} />
              <span className="block truncate px-1.5 py-1 text-[10.5px] leading-tight text-ink">{d.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function SurfaceControls({ surface, onChange }: { surface: Surface; onChange: (p: Partial<Surface>) => void }) {
  const { decor, collection } = findDecor(surface.decorId);
  const size = collection.sizes.find((s) => s.label === surface.size) ?? collection.sizes[0];
  const rect = size.w !== size.h;

  return (
    <>
      <Section
        title="Выбранный декор"
        aside={
          <a href={`${SITE_URL}${decor.href}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-accent hover:text-accent-ink">
            На сайте ↗
          </a>
        }
      >
        <div className="flex items-center gap-3">
          <span className="h-12 w-16 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-line" style={{ backgroundImage: `url(${decor.texture})` }} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-ink">{decor.name}</p>
            <p className="truncate text-xs text-ink-faint">
              {collection.brand} · коллекция «{collection.name}»{decor.article ? ` · арт. ${decor.article}` : ''}
            </p>
          </div>
        </div>
      </Section>
      <Section title="Формат плитки, мм">
        <Chips label="Формат" value={size.label} options={collection.sizes.map((s) => [s.label, s.label])} onChange={(v) => onChange({ size: v })} />
      </Section>
      {rect && (
        <Section title="Раскладка">
          <Chips<Layout>
            label="Раскладка"
            value={surface.layout}
            options={(Object.keys(LAYOUT_LABELS) as Layout[]).map((l) => [l, LAYOUT_LABELS[l]])}
            onChange={(v) => onChange({ layout: v })}
          />
        </Section>
      )}
      <Section title="Затирка">
        <div className="flex gap-2">
          {(Object.keys(GROUT_COLORS) as Grout[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ grout: g })}
              aria-pressed={surface.grout === g}
              className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-xs transition-colors duration-150 ${
                surface.grout === g ? 'border-ink text-ink' : 'border-line text-ink-soft hover:border-ink-faint'
              }`}
            >
              <span className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: GROUT_COLORS[g] }} />
              {GROUT_LABELS[g]}
            </button>
          ))}
        </div>
      </Section>
      {collection.surfaces.length > 1 && (
        <Section title="Поверхность">
          <Chips label="Поверхность" value={surface.finish} options={collection.surfaces.map((s) => [s, s])} onChange={(v) => onChange({ finish: v })} />
        </Section>
      )}
    </>
  );
}

/** Picks a decor and keeps the format valid for its collection. */
function useDecorPick(surface: Surface, onChange: (p: Partial<Surface>) => void) {
  return (decorId: string) => {
    const { collection } = findDecor(decorId);
    const keep = collection.sizes.some((s) => s.label === surface.size);
    onChange({
      decorId,
      size: keep ? surface.size : collection.sizes[0].label,
      finish: collection.surfaces.includes(surface.finish) ? surface.finish : collection.surfaces[0],
    });
  };
}

export function RoomSizePanel() {
  const room = usePlanner((s) => s.room);
  const resize = usePlanner((s) => s.resize);
  const field = (label: string, key: 'length' | 'width' | 'height', min: number, max: number) => (
    <label className="block">
      <span className="text-[11px] text-ink-faint">{label}</span>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-line px-1">
        <button type="button" aria-label="Меньше" className="grid h-8 w-7 place-items-center rounded-lg hover:bg-surface active:scale-90" onClick={() => resize({ [key]: Math.max(min, Math.round((room[key] - 0.1) * 100) / 100) })}>
          −
        </button>
        <span className="flex-1 text-center text-sm font-semibold tabular-nums">{fmt(room[key], 2)}</span>
        <button type="button" aria-label="Больше" className="grid h-8 w-7 place-items-center rounded-lg hover:bg-surface active:scale-90" onClick={() => resize({ [key]: Math.min(max, Math.round((room[key] + 0.1) * 100) / 100) })}>
          +
        </button>
      </div>
    </label>
  );
  return (
    <Section title={`Помещение · ${fmt(room.length * room.width)} м²`}>
      <div className="grid grid-cols-3 gap-2">
        {field('Длина, м', 'length', 1, 15)}
        {field('Ширина, м', 'width', 1, 15)}
        {field('Высота, м', 'height', 2.2, 4.5)}
      </div>
    </Section>
  );
}

/** Whole / half / custom amount — shared by the floor and the walls. */
function AmountChips({ value, onChange, label, allLabel = 'Весь' }: { value: number; onChange: (v: number) => void; label: string; allLabel?: string }) {
  const preset = value >= 0.999 ? 'all' : Math.abs(value - 0.5) < 0.001 ? 'half' : 'custom';
  return (
    <>
      <Chips<'all' | 'half' | 'custom'>
        label={label}
        value={preset}
        options={[
          ['all', allLabel],
          ['half', 'Половина'],
          ['custom', 'Своё количество'],
        ]}
        onChange={(v) => onChange(v === 'all' ? 1 : v === 'half' ? 0.5 : preset === 'custom' ? value : 0.75)}
      />
      {preset === 'custom' && (
        <label className="mt-3 block">
          <span className="flex justify-between text-xs text-ink-soft">
            <span>Доля покрытия</span>
            <span className="font-medium tabular-nums text-ink">{Math.round(value * 100)}%</span>
          </span>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={Math.round(value * 100)}
            onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
            className="mt-2 w-full accent-[#E0241B]"
          />
        </label>
      )}
    </>
  );
}

const BASES = ['#d9d4cc', '#c4beb3', '#a9a398', '#8d8a85', '#f1eee8', '#7b6f63'];

export function FloorPanel() {
  const floor = usePlanner((s) => s.floor);
  const setFloor = usePlanner((s) => s.setFloor);
  const room = usePlanner((s) => s.room);
  const pick = useDecorPick(floor, setFloor);
  return (
    <>
      <EditingBadge what="ПОЛ" />
      <RoomSizePanel />
      <Section title={`Сколько пола выложить плиткой · ${fmt(room.length * room.width * floor.coverage)} м²`}>
        <AmountChips label="Покрытие пола" value={floor.coverage} onChange={(v) => setFloor({ coverage: v })} />
        {floor.coverage < 0.999 && (
          <>
            <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide2 text-ink-faint">С какой стороны</p>
            <Chips<FloorFrom>
              label="Начало укладки"
              value={floor.from}
              options={[
                ['back', 'Сзади'],
                ['front', 'Спереди'],
                ['left', 'Слева'],
                ['right', 'Справа'],
              ]}
              onChange={(v) => setFloor({ from: v })}
            />
            <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide2 text-ink-faint">Остальной пол</p>
            <div className="flex flex-wrap gap-2">
              {BASES.map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-label={`Основание ${b}`}
                  aria-pressed={floor.base === b}
                  onClick={() => setFloor({ base: b })}
                  className={`h-8 w-8 rounded-full ring-offset-2 transition-transform duration-150 ease-out-strong active:scale-90 ${floor.base === b ? 'ring-2 ring-accent' : 'ring-1 ring-black/10'}`}
                  style={{ background: b }}
                />
              ))}
            </div>
          </>
        )}
      </Section>
      <SurfaceControls surface={floor} onChange={setFloor} />
      <Section title="Керамогранит для пола">
        <DecorGrid value={floor.decorId} onPick={pick} />
      </Section>
    </>
  );
}

const PAINTS = ['#ece8e1', '#f6f4f0', '#d9d3c9', '#c9cfc8', '#b8b2a8', '#8f8a83', '#4a4b4d'];

const SIDE_PRESETS: [string, string, boolean[]][] = [
  ['all', 'Все 4 стены', [true, true, true, true]],
  ['accent', 'Одна (акцент)', [true, false, false, false]],
  ['sides', 'Боковые две', [false, true, false, true]],
  ['ends', 'Напротив друг друга', [true, false, true, false]],
];

/** Which wall the controls below change: all four together, or one wall on its own. */
function WallSelector({ target, onTarget }: { target: WallTarget; onTarget: (t: WallTarget) => void }) {
  const walls = usePlanner((s) => s.walls);
  const tileOf = (i: number) => (walls.sides[i] !== false && walls.mode !== 'none' ? wallSurface(walls, i) : null);
  const label = (s: Surface) => findDecor(s.decorId).decor.name;
  const same = [0, 1, 2, 3].every((i) => surfaceKey(wallSurface(walls, i)) === surfaceKey(wallSurface(walls, 0)));

  const card = (t: WallTarget, title: string, surf: Surface | null, wide = false, note?: string) => {
    const active = target === t;
    return (
      <button
        key={String(t)}
        type="button"
        aria-pressed={active}
        onClick={() => onTarget(t)}
        className={`flex items-center gap-2.5 rounded-2xl border-2 p-2 text-left transition-[border-color,background-color,transform] duration-150 ease-out-strong active:scale-[0.98] ${wide ? 'col-span-2' : ''} ${
          active ? 'border-accent bg-accent/10' : 'border-line bg-paper hover:border-ink-faint'
        }`}
      >
        <span
          className={`h-10 w-12 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-black/10 ${surf ? '' : 'bg-[repeating-linear-gradient(45deg,#f1eee8,#f1eee8_5px,#e4dfd6_5px,#e4dfd6_10px)]'}`}
          style={surf ? { backgroundImage: `url(${findDecor(surf.decorId).decor.texture})` } : undefined}
        />
        <span className="min-w-0">
          <span className={`block text-[13px] font-semibold leading-tight ${active ? 'text-accent' : 'text-ink'}`}>{title}</span>
          <span className="block truncate text-[11px] leading-tight text-ink-faint">{note ?? (surf ? label(surf) : 'без плитки')}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Какую стену менять">
      {card('all', 'Все стены сразу', tileOf(0) && same ? tileOf(0) : null, true, same ? undefined : 'у стен разная плитка')}
      {([0, 1, 2, 3] as const).map((i) => card(i, `${WALL_NAMES[i]} стена`, tileOf(i)))}
    </div>
  );
}

type HeightKey = 'full' | 'p75' | 'half' | 'p25' | 'apron' | 'custom';

function heightKeyOf(walls: { mode: WallMode; panelHeight: number }, roomH: number, kitchen: boolean): HeightKey {
  if (walls.mode === 'full') return 'full';
  if (walls.mode === 'half') return 'half';
  if (kitchen && Math.abs(walls.panelHeight - 0.6) < 0.02) return 'apron';
  const share = walls.panelHeight / roomH;
  if (!kitchen && Math.abs(share - 0.75) < 0.02) return 'p75';
  if (!kitchen && Math.abs(share - 0.25) < 0.02) return 'p25';
  return 'custom';
}

export function WallsPanel() {
  const walls = usePlanner((s) => s.walls);
  const room = usePlanner((s) => s.room);
  const setWalls = usePlanner((s) => s.setWalls);
  const setWallSurface = usePlanner((s) => s.setWallSurface);
  const target = usePlanner((s) => s.wallTarget);
  const setTarget = usePlanner((s) => s.setWallTarget);

  // the tile controls below act on the chosen wall (or on all of them)
  const surface: Surface = target === 'all' ? walls : wallSurface(walls, target);
  const onSurface = (patch: Partial<Surface>) => setWallSurface(target, patch);
  const pick = useDecorPick(surface, onSurface);
  const targetName = target === 'all' ? 'все стены' : `${WALL_NAMES[target].toLowerCase()} стена`;
  const targetOn = target === 'all' ? walls.sides.every((v) => v !== false) : walls.sides[target] !== false;

  const kitchen = room.type === 'kitchen';
  const { base, height: tileH } = wallTileHeight(walls, room);
  const maxH = Math.round((room.height - base) * 100) / 100;
  const sliderMax = Math.min(maxH, 3.5);
  const hKey = heightKeyOf(walls, room.height, kitchen);
  const lengths = [room.length, room.width, room.length, room.width];
  const sidesOn = [0, 1, 2, 3].filter((i) => walls.sides[i] !== false);
  const span = Math.min(1, Math.max(0.1, walls.span));
  const area = walls.mode === 'none' ? 0 : sidesOn.reduce((n, i) => n + lengths[i] * span * tileH, 0);
  const wallsTotal = lengths.reduce((n, l) => n + l * room.height, 0);

  const sidePreset = SIDE_PRESETS.find(([, , v]) => v.every((x, i) => x === (walls.sides[i] !== false)))?.[0] ?? 'custom';
  const setHeight = (k: HeightKey) => {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    if (k === 'full') setWalls({ mode: 'full' });
    else if (k === 'half') setWalls({ mode: 'half' });
    else if (k === 'p75') setWalls({ mode: 'panel', panelHeight: r2(room.height * 0.75) });
    else if (k === 'p25') setWalls({ mode: 'panel', panelHeight: r2(room.height * 0.25) });
    else if (k === 'apron') setWalls({ mode: 'panel', panelHeight: 0.6 });
  };
  const heightOptions: [HeightKey, string][] = kitchen
    ? [
        ['full', 'До потолка'],
        ['half', 'Половина'],
        ['apron', 'Фартук'],
      ]
    : [
        ['full', 'До потолка'],
        ['p75', '3/4'],
        ['half', 'Половина'],
        ['p25', '1/4'],
      ];
  const chipCls = (active: boolean, tone: 'red' | 'dark' = 'red') =>
    `rounded-full border px-3 py-1.5 text-xs transition-[color,background-color,border-color,transform] duration-150 ease-out-strong active:scale-[0.96] ${
      active ? (tone === 'red' ? 'border-accent bg-accent text-paper' : 'border-ink bg-ink text-paper') : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
    }`;

  const toggleTarget = (on: boolean) =>
    setWalls({ sides: [0, 1, 2, 3].map((i) => (target === 'all' || i === target ? on : walls.sides[i] !== false)) });
  const anyOn = walls.sides.some((v) => v !== false);
  const showTiles = walls.mode !== 'none' && (target !== 'all' || anyOn);

  return (
    <>
      <EditingBadge what={target === 'all' ? 'ВСЕ СТЕНЫ' : `${WALL_NAMES[target].toUpperCase()} СТЕНУ`} />
      <Section title="1 · Какую стену меняем">
        <WallSelector target={target} onTarget={setTarget} />
        {walls.mode === 'none' ? (
          <p className="mt-3 text-sm text-ink-soft">Сейчас стены без плитки. Выберите высоту ниже, и они появятся.</p>
        ) : (
          <>
            <div className="mt-3">
              <Chips<'on' | 'off'>
                label="Плитка на выбранной стене"
                value={targetOn ? 'on' : 'off'}
                options={[
                  ['on', target === 'all' ? 'Плитка на всех' : 'С плиткой'],
                  ['off', target === 'all' ? 'Без плитки' : 'Без плитки (краска)'],
                ]}
                onChange={(v) => toggleTarget(v === 'on')}
              />
            </div>
            {target === 'all' && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide2 text-ink-faint">Быстро</p>
                <Chips
                  label="Быстрый выбор стен"
                  value={sidePreset}
                  options={SIDE_PRESETS.map(([k, text]) => [k, text] as [string, string])}
                  onChange={(k) => setWalls({ sides: SIDE_PRESETS.find(([key]) => key === k)![2] })}
                />
              </div>
            )}
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              {target === 'all'
                ? 'Плитка ниже ляжет на все стены. Чтобы сделать стены разными, выберите нужную стену выше.'
                : `Плитка ниже — только для стены «${WALL_NAMES[target]}». Остальные стены не изменятся.`}
            </p>
          </>
        )}
      </Section>
      {showTiles && (
        <>
          <Section title={`2 · Плитка: ${targetName}`}>
            <DecorGrid key={String(target)} value={surface.decorId} onPick={pick} />
          </Section>
          <SurfaceControls surface={surface} onChange={onSurface} />
        </>
      )}
      <Section title={`3 · На какую высоту${walls.mode === 'none' ? '' : ` · ${fmt(tileH, 2)} м`}`}>
        <div className="flex flex-wrap gap-1.5">
          {heightOptions.map(([k, text]) => (
            <button key={k} type="button" aria-pressed={walls.mode !== 'none' && hKey === k} onClick={() => setHeight(k)} className={chipCls(walls.mode !== 'none' && hKey === k)}>
              {text}
            </button>
          ))}
          <button type="button" aria-pressed={walls.mode === 'none'} onClick={() => setWalls({ mode: 'none' })} className={chipCls(walls.mode === 'none', 'dark')}>
            Без плитки
          </button>
        </div>
        {walls.mode !== 'none' && (
          <label className="mt-3 block">
            <span className="flex justify-between text-xs text-ink-soft">
              <span>{kitchen && hKey === 'apron' ? 'Высота фартука' : 'Точная высота плитки'}</span>
              <span className="font-medium tabular-nums text-ink">
                {fmt(tileH, 2)} м · {Math.round((tileH / room.height) * 100)}% стены
              </span>
            </span>
            <input
              type="range"
              min={0.3}
              max={sliderMax}
              step={0.05}
              value={Math.min(tileH, sliderMax)}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setWalls(v >= maxH - 0.02 && !kitchen ? { mode: 'full' } : { mode: 'panel', panelHeight: v });
              }}
              className="mt-2 w-full accent-[#E0241B]"
            />
          </label>
        )}
      </Section>
      {walls.mode !== 'none' && (
        <Section title="4 · Какая часть стены по ширине">
          <AmountChips label="Ширина покрытия" value={walls.span} onChange={(v) => setWalls({ span: v })} allLabel="Вся ширина" />
        </Section>
      )}
      <div className="px-5 pb-1 pt-4">
        <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
          {walls.mode === 'none' || sidesOn.length === 0 ? (
            <p className="text-sm font-medium text-accent">Плитка на стенах не выбрана</p>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide2 text-accent/80">Итого плитки на стенах</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                ≈ {fmt(area)} м² <span className="text-sm font-normal text-ink-soft">из {fmt(wallsTotal)} м² всех стен · {Math.round((area / wallsTotal) * 100)}%</span>
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {sidesOn.length} {plural(sidesOn.length, 'стена', 'стены', 'стен')}, высота {fmt(tileH, 2)} м, ширина {Math.round(span * 100)}%
              </p>
            </>
          )}
        </div>
      </div>
      <Section title="Цвет покраски">
        <div className="flex flex-wrap gap-2">
          {PAINTS.map((p) => (
            <button
              key={p}
              type="button"
              aria-label={`Краска ${p}`}
              aria-pressed={walls.paint === p}
              onClick={() => setWalls({ paint: p })}
              className={`h-8 w-8 rounded-full ring-offset-2 transition-transform duration-150 ease-out-strong active:scale-90 ${walls.paint === p ? 'ring-2 ring-accent' : 'ring-1 ring-black/10'}`}
              style={{ background: p }}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
