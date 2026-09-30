import { useMemo, useState } from 'react';
import { findDecor, lookLabels, SITE_URL, tileCollections } from '../data/catalog';
import { usePlanner, type Surface, type WallMode } from '../store';
import { GROUT_COLORS, GROUT_LABELS, LAYOUT_LABELS, type Grout, type Layout } from '../three/tileOptions';
import { fmt } from './format';

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

export function FloorPanel() {
  const floor = usePlanner((s) => s.floor);
  const setFloor = usePlanner((s) => s.setFloor);
  const pick = useDecorPick(floor, setFloor);
  return (
    <>
      <RoomSizePanel />
      <SurfaceControls surface={floor} onChange={setFloor} />
      <Section title="Керамогранит для пола">
        <DecorGrid value={floor.decorId} onPick={pick} />
      </Section>
    </>
  );
}

const PAINTS = ['#ece8e1', '#f6f4f0', '#d9d3c9', '#c9cfc8', '#b8b2a8', '#8f8a83', '#4a4b4d'];

export function WallsPanel() {
  const walls = usePlanner((s) => s.walls);
  const room = usePlanner((s) => s.room);
  const setWalls = usePlanner((s) => s.setWalls);
  const pick = useDecorPick(walls, setWalls);
  return (
    <>
      <Section title="Облицовка стен">
        <Chips<WallMode>
          label="Облицовка"
          value={walls.mode}
          options={[
            ['full', 'До потолка'],
            ['panel', room.type === 'kitchen' ? 'Фартук' : 'Панель'],
            ['none', 'Без плитки'],
          ]}
          onChange={(v) => setWalls({ mode: v })}
        />
        {walls.mode === 'panel' && (
          <label className="mt-3 block">
            <span className="flex justify-between text-xs text-ink-soft">
              <span>Высота {room.type === 'kitchen' ? 'фартука' : 'панели'}</span>
              <span className="font-medium tabular-nums text-ink">{fmt(walls.panelHeight, 2)} м</span>
            </span>
            <input
              type="range"
              min={0.3}
              max={Math.min(2, room.height)}
              step={0.05}
              value={walls.panelHeight}
              onChange={(e) => setWalls({ panelHeight: parseFloat(e.target.value) })}
              className="mt-2 w-full accent-[#E0241B]"
            />
          </label>
        )}
      </Section>
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
      {walls.mode !== 'none' && (
        <>
          <SurfaceControls surface={walls} onChange={setWalls} />
          <Section title="Керамогранит для стен">
            <DecorGrid value={walls.decorId} onPick={pick} />
          </Section>
        </>
      )}
    </>
  );
}
