'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCart, defaultUnit, MAX_QTY, type CartItem } from './CartProvider';
import { CartIcon } from './CartDrawer';

type Payload = Omit<CartItem, 'qty' | 'unit'>;

/** Full add-to-cart control for product pages: quantity stepper + button that morphs into a confirmation. */
export function AddToCart({ item, className = '' }: { item: Payload; className?: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  const unit = defaultUnit(item.kind);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onAdd = () => {
    add({ ...item, qty });
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1800);
  };

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <div className="inline-flex h-[52px] shrink-0 items-center justify-between rounded-full border border-line px-1 sm:w-auto">
        <Step label="Уменьшить" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} d="M3 8h10" />
        <label className="flex items-baseline gap-1 px-1">
          <input
            aria-label={`Количество, ${unit}`}
            inputMode="numeric"
            value={qty}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
              setQty(Number.isFinite(n) ? Math.min(MAX_QTY, Math.max(1, n)) : 1);
            }}
            className="w-11 bg-transparent text-center text-base font-medium tabular-nums text-ink outline-none"
          />
          <span className="text-xs text-ink-faint">{unit}</span>
        </label>
        <Step label="Увеличить" disabled={qty >= MAX_QTY} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} d="M3 8h10M8 3v10" />
      </div>

      <button type="button" onClick={onAdd} className="btn-accent relative flex-1 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={done ? 'done' : 'idle'}
            className="inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            {done ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3 8.5l3.2 3L13 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Добавлено
              </>
            ) : (
              <>
                <CartIcon size={17} />
                В корзину
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

function Step({ label, disabled, onClick, d }: { label: string; disabled?: boolean; onClick: () => void; d: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full text-ink transition-[color,background-color,transform] duration-150 ease-out-strong hover:bg-surface active:scale-90 disabled:text-ink-faint/50 disabled:hover:bg-transparent disabled:active:scale-100"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  );
}

/** Compact round "+" used on product cards. */
export function QuickAdd({ item, className = '' }: { item: Payload; className?: string }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      aria-label={`Добавить в корзину: ${item.title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(item);
        setDone(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDone(false), 1400);
      }}
      className={`grid h-10 w-10 place-items-center rounded-full bg-paper/95 text-ink shadow-card backdrop-blur transition-[background-color,color,transform] duration-150 ease-out-strong hover:bg-ink hover:text-paper active:scale-90 ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.svg
          key={done ? 'done' : 'plus'}
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        >
          <path d={done ? 'M3 8.5l3.2 3L13 5' : 'M3 8h10M8 3v10'} />
        </motion.svg>
      </AnimatePresence>
    </button>
  );
}
