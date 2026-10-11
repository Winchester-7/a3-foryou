/** @author Erbol king */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ROOM_PRESETS, type RoomType } from '../data/objects';
import { SITE_URL, tileCollections } from '../data/catalog';
import { LanguageSwitch } from '../i18n/LocaleProvider';
import { usePlanner } from '../store';
import { Icon } from './icons';
import { Logo } from './Logo';
import { fmt } from './format';

const ICON: Record<RoomType, string> = { bath: 'bath', kitchen: 'kitchen', living: 'sofa', bedroom: 'bed', hall: 'door' };
const ease = [0.23, 1, 0.32, 1] as const;

function Stepper({ label, value, min, max, step = 0.1, onChange, unit = 'м' }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (v: number) => Math.round(Math.min(max, Math.max(min, v)) * 100) / 100;
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <div className="mt-1.5 flex h-12 items-center rounded-2xl border border-line bg-paper px-1 transition-colors focus-within:border-ink">
        <button type="button" aria-label={`Уменьшить: ${label}`} onClick={() => onChange(clamp(value - step))} className="grid h-10 w-10 place-items-center rounded-xl text-ink transition-transform duration-150 ease-out-strong hover:bg-surface active:scale-90">
          −
        </button>
        <input
          inputMode="decimal"
          value={draft ?? fmt(value)}
          onFocus={(e) => {
            setDraft(fmt(value));
            e.currentTarget.select();
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const n = parseFloat((draft ?? '').replace(',', '.'));
            if (Number.isFinite(n)) onChange(clamp(n));
            setDraft(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-full min-w-0 bg-transparent text-center text-lg font-semibold tabular-nums text-ink outline-none"
        />
        <span className="pr-1 text-sm text-ink-faint">{unit}</span>
        <button type="button" aria-label={`Увеличить: ${label}`} onClick={() => onChange(clamp(value + step))} className="grid h-10 w-10 place-items-center rounded-xl text-ink transition-transform duration-150 ease-out-strong hover:bg-surface active:scale-90">
          +
        </button>
      </div>
    </label>
  );
}

export function Setup() {
  const saved = usePlanner((s) => s.room);
  const hasProject = usePlanner((s) => s.hasSaved);
  const start = usePlanner((s) => s.start);
  const [type, setType] = useState<RoomType>(saved.type);
  const [mode, setMode] = useState<'dims' | 'area'>('dims');
  const [length, setLength] = useState(saved.length);
  const [width, setWidth] = useState(saved.width);
  const [height, setHeight] = useState(saved.height);
  const [area, setArea] = useState(Math.round(saved.length * saved.width * 10) / 10);

  // warm up the 3D engine while the client fills in the form
  useEffect(() => {
    const t = window.setTimeout(() => void import('../three/Scene'), 600);
    return () => window.clearTimeout(t);
  }, []);

  const pick = (t: RoomType) => {
    const p = ROOM_PRESETS.find((r) => r.type === t)!;
    setType(t);
    setLength(p.length);
    setWidth(p.width);
    setHeight(p.height);
    setArea(Math.round(p.length * p.width * 10) / 10);
  };

  // area mode: a gently rectangular room (4:3) with that floor area
  const dims = mode === 'area' ? { l: Math.sqrt((area * 4) / 3), w: Math.sqrt((area * 3) / 4) } : { l: length, w: width };
  const L = Math.round(dims.l * 100) / 100;
  const W = Math.round(dims.w * 100) / 100;
  const floorArea = L * W;
  const wallArea = 2 * (L + W) * height;

  return (
    <div className="min-h-[100svh] bg-surface">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <a href={SITE_URL} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper hover:text-ink">
            <Icon name="back" width={16} height={16} /> На сайт
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-4 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-10">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <p className="text-[11px] font-medium uppercase tracking-wide2 text-accent">3D-планировщик A3 FOR YOU</p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-ink">
            Увидьте свой интерьер до&nbsp;покупки
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-[17px] leading-relaxed text-ink-soft">
            Укажите размеры помещения — и мы построим его в 3D. Примеряйте наш керамогранит, двери и мебель: каждая плитка в
            реальном формате, всё меняется мгновенно.
          </p>
          <ul className="mt-8 grid max-w-lg gap-3 text-sm text-ink-soft sm:grid-cols-2">
            {[`${tileCollections.reduce((n, c) => n + c.decors.length, 0)} декоров керамогранита`, 'Двери и диваны', 'Расчёт плитки с запасом 10%', 'Отправка проекта в WhatsApp'].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-paper text-accent shadow-card">
                  <Icon name="check" width={13} height={13} strokeWidth={2.2} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.06 }}
          className="rounded-[28px] bg-paper p-6 shadow-float sm:p-8"
        >
          <p className="text-sm font-semibold text-ink">1. Какое помещение?</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {ROOM_PRESETS.map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => pick(r.type)}
                aria-pressed={type === r.type}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-[border-color,background-color,transform] duration-200 ease-out-strong active:scale-[0.97] ${
                  type === r.type ? 'border-ink bg-ink text-paper' : 'border-line text-ink hover:border-ink-faint'
                }`}
              >
                <Icon name={ICON[r.type]} />
                <span className="text-[13px] font-medium">{r.title}</span>
              </button>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">2. Размеры</p>
            <div className="inline-flex rounded-full bg-surface p-0.5 text-xs" role="radiogroup" aria-label="Способ ввода">
              {(
                [
                  ['dims', 'Длина × ширина'],
                  ['area', 'Площадь, м²'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => {
                    if (m === 'area') setArea(Math.round(length * width * 10) / 10);
                    else {
                      setLength(L);
                      setWidth(W);
                    }
                    setMode(m);
                  }}
                  className={`rounded-full px-3 py-1.5 transition-colors duration-150 ${mode === m ? 'bg-paper font-medium text-ink shadow-sm' : 'text-ink-faint hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {mode === 'dims' ? (
              <>
                <Stepper label="Длина" value={length} min={1} max={15} onChange={setLength} />
                <Stepper label="Ширина" value={width} min={1} max={15} onChange={setWidth} />
              </>
            ) : (
              <div className="col-span-2">
                <Stepper label="Площадь пола" value={area} min={1.5} max={150} step={0.5} unit="м²" onChange={setArea} />
                <p className="mt-2 text-xs text-ink-faint">
                  Построим комнату ≈ {fmt(L)} × {fmt(W)} м — точные размеры можно поменять в любой момент.
                </p>
              </div>
            )}
            <Stepper label="Высота потолка" value={height} min={2.2} max={4.5} onChange={setHeight} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-surface p-4">
            <div>
              <p className="text-xs text-ink-faint">Пол</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{fmt(floorArea)} м²</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">Стены</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-ink">≈ {fmt(wallArea)} м²</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => start({ type, length: L, width: W, height })}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold uppercase tracking-wide2 text-paper shadow-float transition-[background-color,transform] duration-150 ease-out-strong hover:bg-accent-ink active:scale-[0.98]"
          >
            <Icon name="cube" width={18} height={18} /> Построить 3D-комнату
          </button>
          {hasProject && (
            <button
              type="button"
              onClick={() => usePlanner.setState({ step: 'editor' })}
              className="mt-3 w-full rounded-full py-3 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Продолжить сохранённый проект →
            </button>
          )}
        </motion.section>
      </main>
    </div>
  );
}
