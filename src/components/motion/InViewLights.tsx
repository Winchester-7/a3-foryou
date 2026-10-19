'use client';

/** @author Erbol king */
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Sets `data-lit` on its wrapper once it scrolls into view, so CSS can play a
 * one-time "lights on" moment. Content is fully visible without JS.
 */
export function InViewLights({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLit(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} data-lit={lit || undefined}>
      {children}
    </div>
  );
}

/** Counts up to `value` once when it first becomes visible. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1300;
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - k, 4); // strong ease-out: fast start, gentle landing
          el.textContent = fmt(value * eased);
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        el.textContent = fmt(0);
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  // server-rendered final number: correct for no-JS, crawlers and reduced motion
  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
