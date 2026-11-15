'use client';

/**
 * Cards "laid" like ceramic tiles: each one is revealed from the top edge while it tips
 * flat, and a band of light glides across its photo. Cards that scroll into view together
 * land one after another, left to right and top to bottom.
 *
 * Visible by default: the hiding rule only exists when the head script set `html.js`.
 * Two independent triggers (IntersectionObserver + a shared scroll check) make sure a card
 * can never stay hidden. "Reduce motion" skips the effect in CSS.
 * @author Erbol king
 */
import { useEffect, useRef, type ReactNode } from 'react';

const pending = new Set<HTMLElement>();
let observer: IntersectionObserver | null = null;
let listening = false;
let raf = 0;

/** reveal a batch: they land one after another in reading order */
function reveal(els: HTMLElement[]) {
  const fresh = els.filter((e) => pending.has(e));
  fresh
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .sort((a, b) => Math.round(a.r.top / 20) - Math.round(b.r.top / 20) || a.r.left - b.r.left)
    .forEach(({ e }, i) => {
      e.style.setProperty('--d', `${Math.min(i, 11) * 75}ms`);
      e.classList.add('tile-go');
      pending.delete(e);
      observer?.unobserve(e);
    });
  if (pending.size === 0) stopListening();
}

const onScreen = (e: HTMLElement) => {
  const r = e.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.bottom > 0 && r.top < vh * 0.94;
};

function check() {
  raf = 0;
  reveal(Array.from(pending).filter(onScreen));
}
// a short timer instead of requestAnimationFrame: it also runs in background/throttled tabs
const schedule = () => {
  if (!raf) raf = window.setTimeout(check, 40);
};
function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}
function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
}

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!observer) {
    observer = new IntersectionObserver((entries) => reveal(entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)), {
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.08,
    });
  }
  return observer;
}

/** Adds `tile-go` (and a stagger delay `--d`) to the element once it scrolls into view. */
export function useLand<T extends HTMLElement>(ref: { current: T | null }) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    pending.add(el);
    getObserver()?.observe(el);
    startListening();
    schedule(); // already on screen at mount
    return () => {
      pending.delete(el);
      observer?.unobserve(el);
      if (pending.size === 0) stopListening();
    };
  }, [ref]);
}

export function TileIn({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLand(ref);

  // a mouse over the card tips it a few degrees towards the pointer and a light spot follows it
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${Math.round(x * 100)}%`);
    el.style.setProperty('--my', `${Math.round(y * 100)}%`);
    el.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    ['--rx', '--ry'].forEach((p) => el.style.setProperty(p, '0deg'));
  };

  return (
    <div ref={ref} className={`tile-in ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}

/** The band of light and the pointer glare — put it inside the photo container (relative, overflow-hidden). */
export function TileGloss() {
  return (
    <>
      <span className="tile-gloss" aria-hidden />
      <span className="tile-glare" aria-hidden />
    </>
  );
}
