import { AnimatePresence, motion } from 'motion/react';
import { doorModels, findDoor, findSofa, SITE_URL, sofaModels } from '../data/catalog';
import { OBJECTS, type ObjDef, type ObjKind } from '../data/objects';
import { usePlanner } from '../store';
import { Icon } from './icons';
import { Section, Chips } from './SurfacePanel';

const GROUPS: ObjDef['group'][] = ['Ванная', 'Кухня', 'Мебель', 'Декор'];

export function ObjectsPanel() {
  const add = usePlanner((s) => s.addObject);
  return (
    <>
      <Section title="Двери Diford">
        <div className="grid grid-cols-3 gap-2">
          {doorModels.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => add('door', { ref: d.slug, color: d.colors[0].hex, colorName: d.colors[0].name })}
              className="group overflow-hidden rounded-xl bg-surface text-left ring-1 ring-line transition-[box-shadow,transform] duration-150 ease-out-strong hover:ring-ink-faint active:scale-[0.97]"
            >
              <span className="block aspect-[3/4] bg-contain bg-center bg-no-repeat mix-blend-multiply" style={{ backgroundImage: `url(${d.image})` }} />
              <span className="block truncate bg-paper px-1.5 py-1 text-[10.5px] text-ink">{d.name}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Диваны и кресла Delavega">
        <div className="grid grid-cols-2 gap-2">
          {sofaModels.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => add('sofa', { ref: s.slug, size: s.sizes[0], color: s.fabrics[0].hex, colorName: s.fabrics[0].name })}
              className="overflow-hidden rounded-xl bg-surface text-left ring-1 ring-line transition-[box-shadow,transform] duration-150 ease-out-strong hover:ring-ink-faint active:scale-[0.97]"
            >
              <span className="block aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${s.image})` }} />
              <span className="block truncate bg-paper px-2 py-1 text-[11px] text-ink">
                {s.kind} {s.name}
              </span>
            </button>
          ))}
        </div>
      </Section>
      {GROUPS.map((g) => (
        <Section key={g} title={g}>
          <div className="grid grid-cols-3 gap-2">
            {(Object.values(OBJECTS) as ObjDef[])
              .filter((d) => d.group === g && d.kind !== 'sofa')
              .map((d) => (
                <button
                  key={d.kind}
                  type="button"
                  onClick={() => add(d.kind as ObjKind)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line px-1 py-3 text-center text-ink transition-[border-color,transform] duration-150 ease-out-strong hover:border-ink-faint active:scale-[0.97]"
                >
                  <Icon name={d.icon} />
                  <span className="text-[11px] leading-tight">{d.label}</span>
                </button>
              ))}
          </div>
        </Section>
      ))}
      <p className="px-5 pb-6 pt-2 text-xs leading-relaxed text-ink-faint">
        Нажмите на предмет в комнате, чтобы выбрать его, и перетащите мышью или пальцем. Двери и шкафы сами прилипают к ближайшей стене.
      </p>
    </>
  );
}

/** Floating toolbar for the selected object. */
export function SelectionBar() {
  const selected = usePlanner((s) => s.objects.find((o) => o.id === s.selectedId));
  const update = usePlanner((s) => s.updateObject);
  const rotate = usePlanner((s) => s.rotateObject);
  const duplicate = usePlanner((s) => s.duplicateObject);
  const remove = usePlanner((s) => s.removeObject);
  const select = usePlanner((s) => s.select);

  let title = '';
  let swatches: { name: string; hex: string }[] = [];
  let href: string | null = null;
  let sizes: string[] = [];
  if (selected) {
    const def = OBJECTS[selected.kind];
    title = def.label;
    swatches = def.colors ?? [];
    if (selected.kind === 'door') {
      const m = findDoor(selected.ref);
      title = `Дверь ${m.name}`;
      swatches = m.colors;
      href = m.href;
    }
    if (selected.kind === 'sofa') {
      const m = findSofa(selected.ref);
      title = `${m.kind} ${m.name}`;
      swatches = m.fabrics;
      sizes = m.sizes;
      href = m.href;
    }
  }

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          key="sel"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] } }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.14 } }}
          className="pointer-events-auto w-[min(560px,calc(100vw-24px))] rounded-2xl border border-line bg-paper/95 p-3 shadow-float backdrop-blur"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 pl-1">
              <p className="truncate text-sm font-semibold text-ink">{title}</p>
              {selected.colorName && <p className="truncate text-xs text-ink-faint">{selected.colorName}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {href && (
                <a href={`${SITE_URL}${href}`} target="_blank" rel="noreferrer" className="mr-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-surface">
                  На сайте ↗
                </a>
              )}
              {!OBJECTS[selected.kind].wall && (
                <ToolBtn label="Повернуть" icon="rotate" onClick={() => rotate(selected.id)} />
              )}
              <ToolBtn label="Копировать" icon="copy" onClick={() => duplicate(selected.id)} />
              <ToolBtn label="Удалить" icon="trash" onClick={() => remove(selected.id)} danger />
              <ToolBtn label="Закрыть" icon="close" onClick={() => select(null)} />
            </div>
          </div>
          {sizes.length > 1 && (
            <div className="mt-2.5">
              <Chips label="Размер, см" value={selected.size ?? sizes[0]} options={sizes.map((s) => [s, `${s} см`])} onChange={(v) => update(selected.id, { size: v })} />
            </div>
          )}
          {swatches.length > 0 && (
            <div className="-mx-3 mt-2.5 overflow-x-auto px-3 [scrollbar-width:none]">
              <div className="flex w-max gap-1.5">
                {swatches.map((c) => (
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
