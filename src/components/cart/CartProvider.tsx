'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CartDrawer } from './CartDrawer';
import { easeOut } from '@/lib/motion';

export type CartUnit = 'м²' | 'шт.';

export interface CartItem {
  /** unique per product + chosen options */
  id: string;
  kind: 'tile' | 'door' | 'sofa';
  title: string;
  /** collection, article, colour, size — whatever identifies the variant */
  details: string;
  image: string;
  href: string;
  qty: number;
  unit: CartUnit;
}

type NewItem = Omit<CartItem, 'qty' | 'unit'> & { qty?: number; unit?: CartUnit };

interface CartCtx {
  items: CartItem[];
  count: number;
  add: (item: NewItem) => void;
  setQty: (id: string, qty: number) => void;
  setUnit: (id: string, unit: CartUnit) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = 'a3-cart-v1';
export const MAX_QTY = 9999;

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export const defaultUnit = (kind: CartItem['kind']): CartUnit => (kind === 'tile' ? 'м²' : 'шт.');
const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<{ key: number; title: string } | null>(null);
  // Persist only after the saved cart has been restored — otherwise the first
  // (empty) render would overwrite storage before we read it (StrictMode runs effects twice).
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<number>();

  // Restore after mount so SSR and first client render agree.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && typeof i.id === 'string'));
      }
    } catch {
      /* storage unavailable — cart just starts empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [items, ready]);

  // Keep several tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(e.newValue ? JSON.parse(e.newValue) : []);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((item: NewItem) => {
    const qty = clampQty(item.qty ?? 1);
    setItems((prev) => {
      const hit = prev.find((i) => i.id === item.id);
      if (hit) return prev.map((i) => (i.id === item.id ? { ...i, qty: clampQty(i.qty + qty) } : i));
      return [...prev, { ...item, qty, unit: item.unit ?? defaultUnit(item.kind) }];
    });
    window.clearTimeout(toastTimer.current);
    setToast({ key: Date.now(), title: item.title });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clampQty(qty) } : i)));
  }, []);
  const setUnit = useCallback((id: string, unit: CartUnit) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unit } : i)));
  }, []);
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => {
    setToast(null);
    setOpen(true);
  }, []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo<CartCtx>(
    () => ({ items, count: items.length, add, setQty, setUnit, remove, clear, isOpen, openCart, closeCart }),
    [items, add, setQty, setUnit, remove, clear, isOpen, openCart, closeCart],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
      <AddedToast toast={toast} onOpen={openCart} onClose={() => setToast(null)} />
    </Ctx.Provider>
  );
}

function AddedToast({
  toast,
  onOpen,
  onClose,
}: {
  toast: { key: number; title: string } | null;
  onOpen: () => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[75] flex justify-center px-4 sm:bottom-auto sm:left-auto sm:right-6 sm:top-[calc(var(--header-h)+12px)] sm:justify-end">
      <AnimatePresence>
        {toast && (
          <motion.div
            key="cart-toast"
            role="status"
            layout
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: easeOut } }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.16, ease: easeOut } }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-paper/95 p-3 pl-4 shadow-float backdrop-blur"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1f8f4c] text-white">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <motion.span key={toast.key} className="min-w-0 flex-1" initial={{ opacity: 0, filter: 'blur(2px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}>
              <span className="block text-[13px] font-medium text-ink">Добавлено в корзину</span>
              <span className="block truncate text-xs text-ink-faint">{toast.title}</span>
            </motion.span>
            <button type="button" onClick={onOpen} className="shrink-0 rounded-full bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-wide2 text-paper transition-transform duration-150 ease-out-strong active:scale-[0.97]">
              Открыть
            </button>
            <button type="button" aria-label="Скрыть" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:text-ink">
              <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
