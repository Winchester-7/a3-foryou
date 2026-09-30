'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Logo } from '@/components/brand/Logo';
import { mainNav, site } from '@/lib/site';
import type { SearchDoc } from './SiteHeader';
import { useCart } from '@/components/cart/CartProvider';
import { CartIcon } from '@/components/cart/CartDrawer';
import { drawerIn, drawerOut, easeOut } from '@/lib/motion';

type MenuItem = { slug: string; title: string; tagline: string };

const ease = easeOut;

const FURNITURE_LINKS = [
  { href: '/doors', title: 'Двери', tagline: 'Межкомнатные двери Diford' },
  { href: '/sofas', title: 'Диваны', tagline: 'Диваны и кресла Delavega' },
  { href: site.plannerUrl, title: 'Создать свой интерьер', tagline: '3D-планировщик: ваша комната, наш керамогранит' },
];

const WA_ICON = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.5-1.2-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
  </svg>
);

export function Header({
  overlay,
  index,
  catalogMenu,
  interiorMenu,
}: {
  overlay: boolean;
  index: SearchDoc[];
  catalogMenu: MenuItem[];
  interiorMenu: MenuItem[];
}) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMega, setOpenMega] = useState<null | 'catalog' | 'interior'>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpenMega(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const locked = mobileOpen || searchOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMega(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const solid = !overlay || scrolled || openMega !== null;
  const tone: 'dark' | 'light' = solid ? 'dark' : 'light';
  const iconBtn = solid ? 'text-ink hover:bg-surface' : 'text-white hover:bg-white/10';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ease-out-strong ${
          solid ? 'border-b border-line bg-paper/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
        }`}
        onMouseLeave={() => setOpenMega(null)}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
          <Logo tone={tone} />

          <nav className="hidden items-center gap-x-4 xl:gap-x-6 2xl:gap-x-7 lg:flex">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <div key={item.href} className="relative shrink-0" onMouseEnter={() => setOpenMega(item.mega ?? null)}>
                  <Link
                    href={item.href}
                    className={`link-underline whitespace-nowrap py-2 text-[12px] xl:text-[13px] font-medium uppercase tracking-[0.08em] xl:tracking-wide2 transition-colors duration-200 ${
                      solid ? 'text-ink' : 'text-white'
                    } ${active ? 'text-accent opacity-100' : 'opacity-80 hover:opacity-100'}`}
                  >
                    {item.label}
                    {item.mega && (
                      <svg width="10" height="10" viewBox="0 0 10 10" className="ml-1.5 opacity-60" aria-hidden>
                        <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                      </svg>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${site.phoneHref}`}
              className={`hidden text-[13px] font-medium tracking-wide2 xl:block ${solid ? 'text-ink' : 'text-white'}`}
            >
              {site.phone}
            </a>

            {/* mobile call button */}
            <a
              href={`tel:${site.phoneHref}`}
              aria-label="Позвонить"
              className={`grid h-10 w-10 place-items-center rounded-full sm:hidden ${iconBtn}`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 5c0 8.3 6.7 15 15 15 .6 0 1-.4 1-1v-3.3c0-.4-.3-.8-.7-.9l-3.6-1a1 1 0 0 0-1 .3l-1 1.2A12 12 0 0 1 8.4 9.3l1.2-1a1 1 0 0 0 .3-1l-1-3.6A1 1 0 0 0 8 3H4.7c-.4 0-.7.3-.7.7Z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>

            <button
              type="button"
              aria-label="Поиск по каталогу"
              onClick={() => setSearchOpen(true)}
              className={`grid h-10 w-10 place-items-center rounded-full transition-colors duration-200 ${iconBtn}`}
            >
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden>
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <CartButton className={iconBtn} />

            <button
              type="button"
              aria-label="Открыть меню"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className={`grid h-10 w-10 place-items-center rounded-full lg:hidden ${iconBtn}`}
            >
              <span className="relative block h-3.5 w-5">
                <span className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-[transform,opacity] duration-200 ease-out-strong ${mobileOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-[transform,opacity] duration-200 ease-out-strong ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute left-0 top-3 h-0.5 w-full bg-current transition-[transform,opacity] duration-200 ease-out-strong ${mobileOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {openMega && (
            <motion.div
              key={openMega}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, transition: { duration: 0.15, ease } }}
              transition={{ duration: 0.22, ease }}
              className="absolute inset-x-0 top-[var(--header-h)] hidden border-t border-line bg-paper shadow-card lg:block"
            >
              <div className="container-x py-10">
                <div className="grid grid-cols-[1.1fr_2fr] gap-12">
                  <div>
                    <p className="eyebrow">{openMega === 'catalog' ? 'Каталог керамогранита' : 'Интерьер и мебель'}</p>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
                      {openMega === 'catalog'
                        ? 'Коллекции IDALGO, GRANITEA и «Уральский Гранит» — под мрамор, камень, дерево, бетон, для фасадов и террас.'
                        : 'Мебель и сантехника, подобранные под палитру наших коллекций керамогранита.'}
                    </p>
                    <Link href={openMega === 'catalog' ? '/catalog' : '/interior'} className="btn-outline mt-6">
                      {openMega === 'catalog' ? 'Весь каталог' : 'Весь раздел'}
                    </Link>
                  </div>
                  <div>
                    {openMega === 'interior' && (
                      <div className="mb-6 grid grid-cols-3 gap-x-8 gap-y-4 border-b border-line pb-6">
                        {FURNITURE_LINKS.map((c) => (
                          <Link key={c.href} href={c.href} className="group block">
                            <span className="block text-[15px] font-medium text-accent">{c.title}</span>
                            <span className="mt-1 block text-xs leading-snug text-ink-faint">{c.tagline}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                      {(openMega === 'catalog' ? catalogMenu : interiorMenu).map((c) => (
                        <Link
                          key={c.slug}
                          href={
                            openMega === 'catalog'
                              ? `/catalog/${c.slug}`
                              : c.slug === 'divany'
                                ? '/sofas'
                                : c.slug === 'dveri'
                                  ? '/doors'
                                  : `/interior/${c.slug}`
                          }
                          className="group block"
                        >
                          <span className="block text-[15px] font-medium text-ink transition-colors group-hover:text-accent">
                            {c.title}
                          </span>
                          <span className="mt-1 block text-xs leading-snug text-ink-faint">{c.tagline}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} catalogMenu={catalogMenu} interiorMenu={interiorMenu} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} index={index} />
    </>
  );
}

function MobileNav({
  open,
  onClose,
  catalogMenu,
  interiorMenu,
}: {
  open: boolean;
  onClose: () => void;
  catalogMenu: MenuItem[];
  interiorMenu: MenuItem[];
}) {
  const [section, setSection] = useState<null | 'catalog' | 'interior'>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }} onClick={onClose} />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-paper lg:hidden"
            initial={{ x: '100%' }} animate={{ x: 0, transition: drawerIn }} exit={{ x: '100%', transition: drawerOut }}
          >
            <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-5">
              <span className="eyebrow">Меню</span>
              <button type="button" aria-label="Закрыть меню" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              {section === null && (
                <ul className="space-y-1">
                  {mainNav.map((item) =>
                    item.mega ? (
                      <li key={item.href}>
                        <button type="button" onClick={() => setSection(item.mega!)} className="flex w-full items-center justify-between py-3 text-lg font-medium text-ink">
                          {item.label}
                          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
                        </button>
                      </li>
                    ) : (
                      <li key={item.href}>
                        <Link href={item.href} onClick={onClose} className="block py-3 text-lg font-medium text-ink">{item.label}</Link>
                      </li>
                    ),
                  )}
                  <li>
                    <a href={site.plannerUrl} className="block py-3 text-lg font-medium text-ink">Создать свой интерьер в 3D</a>
                  </li>
                </ul>
              )}

              {section !== null && (
                <div>
                  <button type="button" onClick={() => setSection(null)} className="mb-4 inline-flex items-center gap-2 text-sm text-ink-soft">
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
                    Назад
                  </button>
                  <ul className="space-y-1">
                    {(section === 'catalog' ? catalogMenu : interiorMenu).map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={
                            section === 'catalog'
                              ? `/catalog/${c.slug}`
                              : c.slug === 'divany'
                                ? '/sofas'
                                : c.slug === 'dveri'
                                  ? '/doors'
                                  : `/interior/${c.slug}`
                          }
                          onClick={onClose}
                          className="block py-2.5 text-base text-ink"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-3">
                      <Link href={section === 'catalog' ? '/catalog' : '/interior'} onClick={onClose} className="text-sm font-medium text-accent">
                        Смотреть всё →
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-line px-5 py-5 text-sm">
              <a href={`tel:${site.phoneHref}`} className="flex items-center gap-2 font-medium text-ink">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 5c0 8.3 6.7 15 15 15 .6 0 1-.4 1-1v-3.3c0-.4-.3-.8-.7-.9l-3.6-1a1 1 0 0 0-1 .3l-1 1.2A12 12 0 0 1 8.4 9.3l1.2-1a1 1 0 0 0 .3-1l-1-3.6A1 1 0 0 0 8 3H4.7c-.4 0-.7.3-.7.7Z" stroke="currentColor" strokeWidth="1.6" /></svg>
                {site.phone}
              </a>
              <a href={site.whatsapp} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 font-medium text-[#1f8f4c]">
                {WA_ICON} WhatsApp
              </a>
              <p className="text-ink-faint">{site.address} · {site.hours}</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ open, onClose, index }: { open: boolean; onClose: () => void; index: SearchDoc[] }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return index.filter((d) => d.keywords.includes(term)).slice(0, 8);
  }, [q, index]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-paper/95 backdrop-blur-lg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
        >
          <div className="container-x flex h-[var(--header-h)] items-center justify-between">
            <span className="eyebrow">Поиск</span>
            <button type="button" aria-label="Закрыть поиск" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>
          </div>

          <div className="container-x">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease, delay: 0.05 }}
              className="mx-auto max-w-3xl pt-[8vh]"
            >
              <div className="flex items-center gap-4 border-b-2 border-ink pb-4">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Коллекция, декор, артикул…"
                  className="w-full bg-transparent text-2xl font-light tracking-tight text-ink outline-none placeholder:text-ink-faint md:text-3xl"
                />
              </div>

              <div className="mt-6">
                <AnimatePresence mode="popLayout">
                  {results.map((r, i) => (
                    <motion.div
                      key={r.href}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease, delay: i * 0.04 }}
                    >
                      <Link href={r.href} onClick={onClose} className="group flex items-center justify-between border-b border-line py-4">
                        <span>
                          <span className="block text-base font-medium text-ink group-hover:text-accent">{r.title}</span>
                          <span className="block text-xs text-ink-faint">{r.subtitle}</span>
                        </span>
                        <svg width="16" height="16" viewBox="0 0 16 16" className="text-ink-faint transition-transform group-hover:translate-x-1" aria-hidden>
                          <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {q.trim().length >= 2 && results.length === 0 && (
                  <p className="py-6 text-sm text-ink-faint">Ничего не найдено. Попробуйте другой запрос.</p>
                )}
                {q.trim().length < 2 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['мрамор', 'дуб', 'бетон', 'терраса', 'фасад', 'IDALGO', 'GRANITEA'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQ(tag.toLowerCase())}
                        className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-wide2 text-ink-soft hover:border-accent hover:text-accent"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartButton({ className }: { className: string }) {
  const { count, openCart } = useCart();
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      aria-label={count ? `Корзина: ${count}` : 'Корзина'}
      onClick={openCart}
      className={`relative grid h-10 w-10 place-items-center rounded-full transition-[background-color,color,transform] duration-150 ease-out-strong active:scale-95 ${className}`}
    >
      <CartIcon />
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            key="badge"
            className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center overflow-hidden rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-paper"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.25 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                className="tabular-nums"
                initial={reduce ? { opacity: 0 } : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: -8, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
