import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { doorModels, SITE_URL, sofaModels, type DoorModel, type SofaModel } from '../data/catalog';
import { objectOptions, OBJECTS, type ObjDef, type ObjKind, type PlacedObject } from '../data/objects';
import { usePlanner } from '../store';
import { Icon } from './icons';
import { Section, Chips } from './SurfacePanel';

/**
 * "Мебель и двери" tab. Like the floor and wall tabs it is split into sections
 * (doors, sofas, bathroom, kitchen…), and every section lets the client pick the
 * model, size and colour of the object they are working with.
 * @author Erbol king
 */
type Cat = 'doors' | 'sofas' | 'bath' | 'kitchen' | 'furniture' | 'decor';

const CATS: [Cat, string][] = [
  ['doors', 'Двери'],
  ['sofas', 'Диваны'],
  ['bath', 'Ванная'],
  ['kitchen', 'Кухня'],
  ['furniture', 'Мебель'],
  ['decor', 'Декор'],
];

const KINDS: Record<Exclude<Cat, 'doors' | 'sofas'>, ObjKind[]> = {
  bath: ['bathtub', 'shower', 'vanity', 'toilet'],
  kitchen: ['kitchen', 'island', 'table'],
  furniture: ['bed', 'wardrobe', 'tv'],
  decor: ['plant', 'rug'],
};

function catOfKind(k: ObjKind): Cat {
  if (k === 'door') return 'doors';
  if (k === 'sofa') return 'sofas';
  return (Object.entries(KINDS).find(([, kinds]) => kinds.includes(k))?.[0] as Cat) ?? 'furniture';
}

const doorPatch = (m: DoorModel): Partial<PlacedObject> => ({
  ref: m.slug,
  size: m.sizes[0],
  color: m.colors[0]?.hex,
  colorName: m.colors[0]?.name,
});
const sofaPatch = (m: SofaModel): Partial<PlacedObject> => ({
  ref: m.slug,
  size: m.sizes[0],
  color: m.fabrics[0].hex,
  colorName: m.fabrics[0].name,
});

export function ObjectsPanel() {
  const selected = usePlanner((s) => s.objects.find((o) => o.id === s.selectedId));
  const [cat, setCat] = useState<Cat>('doors');

  // picking something in the 3D scene jumps to its section
  useEffect(() => {
    if (selected) setCat(catOfKind(selected.kind));
  }, [selected?.id, selected?.kind]);

  const inCat = selected && catOfKind(selected.kind) === cat ? selected : undefined;

  return (
    <>
      <Section title="Раздел">
        <Chips<Cat> label="Раздел" value={cat} options={CATS} onChange={setCat} />
      </Section>

      {inCat && <SelectedParams o={inCat} />}

      {cat === 'doors' && <DoorGrid selected={inCat} />}
      {cat === 'sofas' && <SofaGrid selected={inCat} />}
      {cat !== 'doors' && cat !== 'sofas' && <KindGrid cat={cat} />}

      <p className="px-5 pb-6 pt-2 text-xs leading-relaxed text-ink-faint">
        Нажмите на предмет в комнате, чтобы выбрать его, и перетащите мышью или пальцем. Двери и шкафы сами прилипают к ближайшей стене.
      </p>
    </>
  );
}

/** Size / colour / model controls for the object that is selected in the room. */
function SelectedParams({ o }: { o: PlacedObject }) {
  const update = usePlanner((s) => s.updateObject);
  const rotate = usePlanner((s) => s.rotateObject);
  const duplicate = usePlanner((s) => s.duplicateObject);
  const remove = usePlanner((s) => s.removeObject);
  const opt = objectOptions(o);
  const def = OBJECTS[o.kind];

  return (
    <Section
      title="Выбранный предмет"
      aside={
        opt.href ? (
          <a href={`${SITE_URL}${opt.href}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-accent hover:text-accent-ink">
            На сайте ↗
          </a>
        ) : undefined
      }
    >
      <p className="text-[15px] font-semibold leading-snug text-ink">{opt.title}</p>
      {o.colorName && <p className="mt-0.5 text-xs text-ink-faint">Цвет: {o.colorName}</p>}

      {opt.sizes.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide2 text-ink-faint">Размер, {opt.unit}</p>
          <div className="flex flex-wrap gap-1.5">
            {opt.sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={s.active}
                onClick={() => update(o.id, s.patch)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-[color,background-color,border-color,transform] duration-150 ease-out-strong active:scale-[0.96] ${
                  s.active ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {opt.colors.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide2 text-ink-faint">Цвет</p>
          <div className="flex flex-wrap gap-2">
            {opt.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={o.color === c.hex}
                onClick={() => update(o.id, { color: c.hex, colorName: c.name })}
                className={`h-8 w-8 rounded-full ring-offset-2 transition-transform duration-150 ease-out-strong active:scale-90 ${
                  o.color === c.hex ? 'ring-2 ring-accent' : 'ring-1 ring-black/10'
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!def.wall && (
          <button type="button" onClick={() => rotate(o.id)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink-faint hover:text-ink">
            <Icon name="rotate" width={14} height={14} /> Повернуть
          </button>
        )}
        <button type="button" onClick={() => duplicate(o.id)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink-faint hover:text-ink">
          <Icon name="copy" width={14} height={14} /> Копировать
        </button>
        <button type="button" onClick={() => remove(o.id)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-accent hover:border-accent">
          <Icon name="trash" width={14} height={14} /> Удалить
        </button>
      </div>
    </Section>
  );
}

const PAGE = 18;

function DoorGrid({ selected }: { selected?: PlacedObject }) {
  const add = usePlanner((s) => s.addObject);
  const update = usePlanner((s) => s.updateObject);
  const [kind, setKind] = useState<'all' | 'interior' | 'entrance'>('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return doorModels.filter(
      (d) => (kind === 'all' || d.kind === kind) && (!term || `${d.name} ${d.brand} ${d.style}`.toLowerCase().includes(term)),
    );
  }, [kind, q]);

  return (
    <Section title={selected ? 'Сменить модель двери' : 'Двери'} aside={<span className="text-xs text-ink-faint">{list.length}</span>}>
      <div className="mb-3">
        <Chips
          label="Тип двери"
          value={kind}
          options={[
            ['all', 'Все'],
            ['interior', 'Межкомнатные'],
            ['entrance', 'Входные'],
          ]}
          onChange={(v) => {
            setKind(v);
            setLimit(PAGE);
          }}
        />
      </div>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setLimit(PAGE);
        }}
        placeholder="Поиск по модели"
        className="mb-3 w-full rounded-xl border border-line bg-surface/60 px-3 py-2 text-sm outline-none focus:border-accent focus:bg-paper"
      />
      <div className="grid grid-cols-3 gap-2">
        {list.slice(0, limit).map((d) => (
          <button
            key={d.slug}
            type="button"
            onClick={() => (selected ? update(selected.id, doorPatch(d)) : add('door', doorPatch(d)))}
            aria-pressed={selected?.ref === d.slug}
            className={`group overflow-hidden rounded-xl bg-surface text-left ring-1 transition-[box-shadow,transform] duration-150 ease-out-strong active:scale-[0.97] ${
              selected?.ref === d.slug ? 'ring-2 ring-accent' : 'ring-line hover:ring-ink-faint'
            }`}
          >
            <span className="block aspect-[3/4] bg-contain bg-center bg-no-repeat mix-blend-multiply" style={{ backgroundImage: `url(${d.image})` }} />
            <span className="block truncate bg-paper px-1.5 py-1 text-[10.5px] text-ink">{d.name}</span>
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="py-6 text-center text-sm text-ink-faint">Ничего не найдено.</p>}
      {list.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="mt-3 w-full rounded-full border border-line py-2 text-xs text-ink-soft hover:border-ink-faint hover:text-ink">
          Показать ещё ({list.length - limit})
        </button>
      )}
    </Section>
  );
}

function SofaGrid({ selected }: { selected?: PlacedObject }) {
  const add = usePlanner((s) => s.addObject);
  const update = usePlanner((s) => s.updateObject);
  const [kind, setKind] = useState<'all' | 'Диван' | 'Кресло'>('all');
  const list = sofaModels.filter((s) => kind === 'all' || s.kind === kind);

  return (
    <Section title={selected ? 'Сменить модель' : 'Диваны и кресла'} aside={<span className="text-xs text-ink-faint">{list.length}</span>}>
      <div className="mb-3">
        <Chips
          label="Тип"
          value={kind}
          options={[
            ['all', 'Все'],
            ['Диван', 'Диваны'],
            ['Кресло', 'Кресла'],
          ]}
          onChange={setKind}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {list.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => (selected ? update(selected.id, sofaPatch(s)) : add('sofa', sofaPatch(s)))}
            aria-pressed={selected?.ref === s.slug}
            className={`overflow-hidden rounded-xl bg-surface text-left ring-1 transition-[box-shadow,transform] duration-150 ease-out-strong active:scale-[0.97] ${
              selected?.ref === s.slug ? 'ring-2 ring-accent' : 'ring-line hover:ring-ink-faint'
            }`}
          >
            <span className="block aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${s.image})` }} />
            <span className="block truncate bg-paper px-2 py-1 text-[11px] text-ink">
              {s.kind} {s.name}
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}

function KindGrid({ cat }: { cat: Exclude<Cat, 'doors' | 'sofas'> }) {
  const add = usePlanner((s) => s.addObject);
  const defs = KINDS[cat].map((k) => OBJECTS[k]) as ObjDef[];
  return (
    <Section title={CATS.find(([c]) => c === cat)?.[1] ?? ''}>
      <div className="grid grid-cols-3 gap-2">
        {defs.map((d) => (
          <button
            key={d.kind}
            type="button"
            onClick={() => add(d.kind)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-1 py-3 text-center text-ink transition-[border-color,transform] duration-150 ease-out-strong hover:border-ink-faint active:scale-[0.97]"
          >
            <Icon name={d.icon} />
            <span className="text-[11px] leading-tight">{d.label}</span>
          </button>
        ))}
      </div>
    </Section>
  );
}

/** Floating toolbar for the selected object (quick access while looking at the room). */
export function SelectionBar() {
  const selected = usePlanner((s) => s.objects.find((o) => o.id === s.selectedId));
  const update = usePlanner((s) => s.updateObject);
  const rotate = usePlanner((s) => s.rotateObject);
  const duplicate = usePlanner((s) => s.duplicateObject);
  const remove = usePlanner((s) => s.removeObject);
  const select = usePlanner((s) => s.select);

  const opt = selected ? objectOptions(selected) : null;

  return (
    <AnimatePresence>
      {selected && opt && (
        <motion.div
          key="sel"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] } }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.14 } }}
          className="pointer-events-auto w-[min(560px,calc(100vw-24px))] rounded-2xl border border-line bg-paper/95 p-3 shadow-float backdrop-blur"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 pl-1">
              <p className="truncate text-sm font-semibold text-ink">{opt.title}</p>
              {selected.colorName && <p className="truncate text-xs text-ink-faint">{selected.colorName}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {opt.href && (
                <a href={`${SITE_URL}${opt.href}`} target="_blank" rel="noreferrer" className="mr-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-surface">
                  На сайте ↗
                </a>
              )}
              {!OBJECTS[selected.kind].wall && <ToolBtn label="Повернуть" icon="rotate" onClick={() => rotate(selected.id)} />}
              <ToolBtn label="Копировать" icon="copy" onClick={() => duplicate(selected.id)} />
              <ToolBtn label="Удалить" icon="trash" onClick={() => remove(selected.id)} danger />
              <ToolBtn label="Закрыть" icon="close" onClick={() => select(null)} />
            </div>
          </div>
          {opt.sizes.length > 1 && (
            <div className="mt-2.5">
              <Chips
                label="Размер"
                value={opt.sizes.find((s) => s.active)?.id ?? opt.sizes[0].id}
                options={opt.sizes.map((s) => [s.id, s.label])}
                onChange={(id) => {
                  const hit = opt.sizes.find((s) => s.id === id);
                  if (hit) update(selected.id, hit.patch);
                }}
              />
            </div>
          )}
          {opt.colors.length > 0 && (
            <div className="-mx-3 mt-2.5 overflow-x-auto px-3 [scrollbar-width:none]">
              <div className="flex w-max gap-1.5">
                {opt.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={selected.color === c.hex}
                    onClick={() => update(selected.id, { color: c.hex, colorName: c.name })}
                    className={`h-7 w-7 shrink-0 rounded-full ring-offset-2 transition-transform duration-150 ease-out-strong active:scale-90 ${
                      selected.color === c.hex ? 'ring-2 ring-accent' : 'ring-1 ring-black/10'
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolBtn({ label, icon, onClick, danger }: { label: string; icon: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-full transition-[background-color,color,transform] duration-150 ease-out-strong active:scale-90 ${
        danger ? 'text-ink-soft hover:bg-accent/10 hover:text-accent' : 'text-ink-soft hover:bg-surface hover:text-ink'
      }`}
    >
      <Icon name={icon} width={18} height={18} />
    </button>
  );
}
