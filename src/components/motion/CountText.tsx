'use client';

/**
 * A number that counts up to its value the first time it is seen. The final value is in the
 * HTML from the start (search engines, no-JS, "reduce motion" all just see it).
 * Non-numeric text is shown as it is.
 * @author Erbol king
 */
import { useEffect, useRef, useState } from 'react';

export function CountText({ value, duration = 1300 }: { value: string; duration?: number }) {
  const m = /^(\D*)(\d[\d\s]*)(.*)$/.exec(value);
  const target = m ? parseInt(m[2].replace(/\s/g, ''), 10) : NaN;
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null); // null = show the real value

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target) || target < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let timer = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 4);
        setShown(Math.round(target * eased));
        if (p < 1) raf = window.requestAnimationFrame(tick);
        else setShown(null);
      };
      setShown(0);
      raf = window.requestAnimationFrame(tick);
      // a throttled tab may not run frames: the real value comes back by itself
      timer = window.setTimeout(() => setShown(null), duration + 600);
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [target, duration]);

  if (!m || shown === null) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {m[1]}
      {shown.toLocaleString('ru-RU')}
      {m[3]}
    </span>
  );
}
