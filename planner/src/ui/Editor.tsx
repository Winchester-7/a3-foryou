import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlanner, type Tab } from '../store';
import { Icon } from './icons';
import { Logo } from './Logo';
import { FloorPanel, WallsPanel } from './SurfacePanel';
import { ObjectsPanel, SelectionBar } from './ObjectsPanel';
import { EstimatePanel, shareUrl } from './EstimatePanel';
import { canvasRef } from '../three/canvasRef';
import { fmt } from './format';

// three.js is the heavy part: load it after the shell is on screen
const Scene = lazy(() => import('../three/Scene').then((m) => ({ default: m.Scene })));

const TABS: [Tab, string][] = [
  ['floor', 'Пол'],
  ['walls', 'Стены'],
  ['objects', 'Мебель и двери'],
  ['estimate', 'Расчёт'],
];

function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          className="pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper shadow-float"
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Editor() {
  const tab = usePlanner((s) => s.tab);
  const setTab = usePlanner((s) => s.setTab);
  const view = usePlanner((s) => s.view);
  const setView = usePlanner((s) => s.setView);
  const room = usePlanner((s) => s.room);
  const undo = usePlanner((s) => s.undo);
  const canUndo = usePlanner((s) => s.history.length > 0);
  const backToSetup = usePlanner((s) => s.backToSetup);
  const [sheet, setSheet] = useState(true); // mobile panel open
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
      const st = usePlanner.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        st.undo();
      }
      if (!st.selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') st.removeObject(st.selectedId);
      if (e.key.toLowerCase() === 'r') st.rotateObject(st.selectedId);
      if (e.key === 'Escape') st.select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const snapshot = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `A3-FOR-YOU-интерьер-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
    setToast('Снимок сохранён');
  };
  const share = async () => {
    const url = shareUrl();
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ title: 'Мой интерьер — A3 FOR YOU', url });
      else {
        await navigator.clipboard.writeText(url);
        setToast('Ссылка на проект скопирована');
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex h-[100svh] flex-col bg-surface">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo compact />
          <button type="button" onClick={backToSetup} className="min-w-0 rounded-xl px-2 py-1 text-left transition-colors hover:bg-surface">
            <span className="block truncate text-sm font-semibold text-ink">
              {{ bath: 'Ванная', kitchen: 'Кухня', living: 'Гостиная', bedroom: 'Спальня', hall: 'Прихожая' }[room.type]}
            </span>
            <span className="block truncate text-[11px] text-ink-faint">
              {fmt(room.length, 2)} × {fmt(room.width, 2)} м · {fmt(room.length * room.width)} м²
            </span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <div className="mr-1 hidden rounded-full bg-surface p-0.5 sm:flex" role="radiogroup" aria-label="Вид">
            {(
              [
                ['3d', '3D', 'cube'],
                ['top', 'План', 'plan'],
              ] as const
            ).map(([v, label, icon]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors duration-150 ${view === v ? 'bg-paper font-medium text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}
              >
                <Icon name={icon} width={15} height={15} /> {label}
              </button>
            ))}
          </div>
          <TopBtn label="Отменить (Ctrl+Z)" icon="undo" onClick={undo} disabled={!canUndo} />
          <TopBtn label="Снимок интерьера" icon="camera" onClick={snapshot} />
          <TopBtn label="Поделиться проектом" icon="share" onClick={share} />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-0 flex-1">
          <Suspense fallback={<div className="grid h-full place-items-center text-sm text-ink-faint">Строим комнату…</div>}>
            <Scene />
          </Suspense>
          <Toast text={toast} />
          {/* mobile view toggle */}
          <div className="absolute left-3 top-3 flex rounded-full bg-paper/95 p-0.5 shadow-card sm:hidden">
            {(['3d', 'top'] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 text-xs ${view === v ? 'bg-ink text-paper' : 'text-ink-soft'}`}>
                {v === '3d' ? '3D' : 'План'}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">
            <SelectionBar />
          </div>
        </div>

        <aside
          className={`relative z-10 flex shrink-0 flex-col border-line bg-paper transition-[height] duration-300 ease-drawer lg:h-auto lg:w-[400px] lg:border-l ${
            sheet ? 'h-[46svh]' : 'h-[52px]'
          }`}
        >
          <nav className="flex shrink-0 items-center gap-1 border-b border-line px-2">
            {TABS.map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setSheet(true);
                }}
                className={`relative flex-1 whitespace-nowrap py-3.5 text-[12.5px] font-medium transition-colors duration-150 ${tab === t ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'}`}
              >
                {label}
                {tab === t && <motion.span layoutId="tab-underline" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }} />}
              </button>
            ))}
            <button type="button" aria-label={sheet ? 'Свернуть панель' : 'Развернуть панель'} onClick={() => setSheet((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft lg:hidden">
              <Icon name="back" width={16} height={16} style={{ transform: `rotate(${sheet ? -90 : 90}deg)`, transition: 'transform 200ms' }} />
            </button>
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
              >
                {tab === 'floor' && <FloorPanel />}
                {tab === 'walls' && <WallsPanel />}
                {tab === 'objects' && <ObjectsPanel />}
                {tab === 'estimate' && <EstimatePanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TopBtn({ label, icon, onClick, disabled }: { label: string; icon: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-[background-color,color,transform] duration-150 ease-out-strong hover:bg-surface hover:text-ink active:scale-90 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      <Icon name={icon} width={19} height={19} />
    </button>
  );
}
