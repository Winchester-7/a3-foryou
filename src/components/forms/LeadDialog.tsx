'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { backdrop, modalIn, modalOut } from '@/lib/motion';
import { LeadForm, type LeadKind } from './LeadForm';

type DialogState = { kind: LeadKind; subject?: string } | null;

type Ctx = {
  open: (kind: LeadKind, subject?: string) => void;
  close: () => void;
};

const LeadCtx = createContext<Ctx | null>(null);

export function useLeadDialog(): Ctx {
  const ctx = useContext(LeadCtx);
  if (!ctx) throw new Error('useLeadDialog must be used inside <LeadDialogProvider>');
  return ctx;
}


const TITLES: Record<LeadKind, { title: string; text: string }> = {
  callback: {
    title: 'Обратный звонок',
    text: 'Оставьте номер — менеджер перезвонит в течение 15 минут в рабочее время.',
  },
  request: {
    title: 'Оставить заявку',
    text: 'Расскажите о проекте: подберём коллекции, рассчитаем объём и стоимость.',
  },
  consult: {
    title: 'Запросить консультацию',
    text: 'Консультация дизайнера по подбору поверхностей — онлайн или в шоуруме.',
  },
};

export function LeadDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(null);

  const open = useCallback((kind: LeadKind, subject?: string) => setState({ kind, subject }), []);
  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    document.body.style.overflow = state ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LeadCtx.Provider value={value}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            {...backdrop}
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={TITLES[state.kind].title}
              className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-paper p-7 sm:rounded-3xl sm:p-9"
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1, transition: modalIn }}
              exit={{ y: 12, scale: 0.98, opacity: 0, transition: modalOut }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Закрыть"
                onClick={close}
                className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-surface"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <p className="eyebrow">A3 FOR YOU</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{TITLES[state.kind].title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{TITLES[state.kind].text}</p>
              <LeadForm kind={state.kind} subject={state.subject} onDone={close} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LeadCtx.Provider>
  );
}
