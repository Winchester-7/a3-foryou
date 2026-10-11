'use client';

/** @author Erbol king */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCart, MAX_QTY, type CartItem, type CartUnit } from './CartProvider';
import { site } from '@/lib/site';
import { backdrop, drawerIn, drawerOut, easeOut } from '@/lib/motion';

const field =
  'w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus:bg-paper';

function buildMessage(items: CartItem[], contact: { name: string; phone: string; comment: string }) {
  const lines = items.map((i, n) => {
    const details = i.details ? ` — ${i.details}` : '';
    return `${n + 1}. ${i.title}${details}\n   Количество: ${i.qty} ${i.unit}\n   ${site.url}${i.href}`;
  });
  const who = [
    contact.name.trim() && `Имя: ${contact.name.trim()}`,
    contact.phone.trim() && `Телефон: ${contact.phone.trim()}`,
    contact.comment.trim() && `Комментарий: ${contact.comment.trim()}`,
  ].filter(Boolean);
  return [
    `Здравствуйте! Хочу оформить заказ на сайте ${site.name}:`,
    '',
    ...lines,
    ...(who.length ? ['', ...who] : []),
    '',
    'Подскажите, пожалуйста, наличие, стоимость и сроки доставки.',
  ].join('\n');
}

export function CartDrawer() {
  const { items, isOpen, closeCart, setQty, setUnit, remove, clear } = useCart();
  const reduce = useReducedMotion();
  const [contact, setContact] = useState({ name: '', phone: '', comment: '' });
  const [confirmClear, setConfirmClear] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeCart]);

  const message = buildMessage(items, contact);
  const waHref = `${site.whatsapp}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${site.email}?subject=${encodeURIComponent(`Заказ с сайта ${site.name}`)}&body=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="cart-backdrop" className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-[2px]" {...backdrop} onClick={closeCart} />
          <motion.aside
            key="cart-panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-[440px] flex-col bg-paper shadow-float outline-none"
            initial={reduce ? { opacity: 0 } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0, transition: drawerIn }}
            exit={reduce ? { opacity: 0 } : { x: '100%', transition: drawerOut }}
          >
            <header className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-6">
              <div>
                <p className="text-lg font-semibold tracking-tight text-ink">Корзина</p>
                <p className="text-xs text-ink-faint">{items.length ? `${items.length} ${plural(items.length, 'позиция', 'позиции', 'позиций')}` : 'Пока пусто'}</p>
              </div>
              <button type="button" aria-label="Закрыть корзину" onClick={closeCart} className="grid h-10 w-10 place-items-center rounded-full transition-[background-color,transform] duration-150 ease-out-strong hover:bg-surface active:scale-95">
                <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" /></svg>
              </button>
            </header>

            {items.length === 0 ? (
              <EmptyState onClose={closeCart} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-6">
                  <ul className="divide-y divide-line">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={item.id}
                          layout={!reduce}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: easeOut } }}
                          transition={{ duration: 0.25, ease: easeOut }}
                          className="overflow-hidden"
                        >
                          <CartLine item={item} onQty={setQty} onUnit={setUnit} onRemove={remove} onNavigate={closeCart} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <div className="mt-2 space-y-3 border-t border-line py-6">
                    <p className="text-[13px] font-medium uppercase tracking-wide2 text-ink">Ваши контакты</p>
                    <p className="text-xs leading-relaxed text-ink-faint">Необязательно, но так менеджер ответит быстрее.</p>
                    <input className={field} placeholder="Имя" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                    <input className={field} placeholder="Телефон" type="tel" inputMode="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                    <textarea className={`${field} min-h-[84px] resize-none`} placeholder="Комментарий: адрес доставки, сроки, вопросы" value={contact.comment} onChange={(e) => setContact({ ...contact, comment: e.target.value })} />
                  </div>
                </div>

                <footer className="shrink-0 space-y-3 border-t border-line bg-paper px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
                  <p className="text-xs leading-relaxed text-ink-soft">
                    Отправьте список нам — менеджер уточнит наличие, рассчитает стоимость и доставку.
                  </p>
                  <a href={waHref} target="_blank" rel="noreferrer noopener" className="btn w-full bg-[#25D366] text-white hover:bg-[#1fb857]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
                    </svg>
                    Отправить в WhatsApp
                  </a>
                  <a href={mailHref} className="btn-outline w-full">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    Отправить на почту
                  </a>
                  <div className="flex justify-center pt-1">
                    <AnimatePresence mode="wait" initial={false}>
                      {confirmClear ? (
                        <motion.div key="confirm" className="flex items-center gap-4 text-xs" initial={{ opacity: 0, filter: 'blur(2px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(2px)' }} transition={{ duration: 0.15 }}>
                          <span className="text-ink-soft">Удалить все позиции?</span>
                          <button type="button" onClick={clear} className="font-medium text-accent hover:text-accent-ink">Да, очистить</button>
                          <button type="button" onClick={() => setConfirmClear(false)} className="text-ink-faint hover:text-ink">Отмена</button>
                        </motion.div>
                      ) : (
                        <motion.button key="clear" type="button" onClick={() => setConfirmClear(true)} className="text-xs text-ink-faint hover:text-ink" initial={{ opacity: 0, filter: 'blur(2px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(2px)' }} transition={{ duration: 0.15 }}>
                          Очистить корзину
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CartLine({
  item,
  onQty,
  onUnit,
  onRemove,
  onNavigate,
}: {
  item: CartItem;
  onQty: (id: string, qty: number) => void;
  onUnit: (id: string, unit: CartUnit) => void;
  onRemove: (id: string) => void;
  onNavigate: () => void;
}) {
  const [draft, setDraft] = useState(String(item.qty));
  useEffect(() => setDraft(String(item.qty)), [item.qty]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n) && n > 0) onQty(item.id, n);
    else setDraft(String(item.qty));
  };

  return (
    <div className="flex gap-4 py-5">
      <Link href={item.href} onClick={onNavigate} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
        <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={item.href} onClick={onNavigate} className="text-[15px] font-medium leading-snug text-ink hover:text-accent">
            {item.title}
          </Link>
          <button type="button" aria-label={`Удалить ${item.title}`} onClick={() => onRemove(item.id)} className="-mr-1.5 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint transition-[color,background-color,transform] duration-150 ease-out-strong hover:bg-surface hover:text-ink active:scale-90">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {item.details && <p className="mt-1 text-xs leading-snug text-ink-faint">{item.details}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="inline-flex h-9 items-center rounded-full border border-line">
            <StepBtn label="Уменьшить" disabled={item.qty <= 1} onClick={() => onQty(item.id, item.qty - 1)}>
              <path d="M3 8h10" />
            </StepBtn>
            <input
              aria-label={`Количество, ${item.unit}`}
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={commit}
              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
              className="w-12 bg-transparent text-center text-sm font-medium tabular-nums text-ink outline-none"
            />
            <StepBtn label="Увеличить" disabled={item.qty >= MAX_QTY} onClick={() => onQty(item.id, item.qty + 1)}>
              <path d="M3 8h10M8 3v10" />
            </StepBtn>
          </div>

          {item.kind === 'tile' ? (
            <div className="inline-flex rounded-full bg-surface p-0.5 text-xs" role="radiogroup" aria-label="Единица измерения">
              {(['м²', 'шт.'] as CartUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={item.unit === u}
                  onClick={() => onUnit(item.id, u)}
                  className={`rounded-full px-3 py-1.5 transition-colors duration-150 ${item.unit === u ? 'bg-paper font-medium text-ink shadow-sm' : 'text-ink-faint hover:text-ink'}`}
                >
                  {u}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-ink-faint">{item.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full text-ink transition-[color,transform] duration-150 ease-out-strong hover:text-accent active:scale-90 disabled:text-ink-faint/50 disabled:active:scale-100"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-surface text-ink-faint">
        <CartIcon size={26} />
      </span>
      <p className="mt-5 text-lg font-semibold text-ink">В корзине пока ничего нет</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
        Добавляйте понравившиеся декоры, двери и диваны — потом одним сообщением отправите весь список нам.
      </p>
      <Link href="/catalog" onClick={onClose} className="btn-solid mt-7">
        Перейти в каталог
      </Link>
    </div>
  );
}

export function CartIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="19.5" r="1.3" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
