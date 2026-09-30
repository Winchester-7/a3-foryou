'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

// Frame geometry of /hero/hero-showroom.mp4 (1924×1076). The hotspot stage is
// sized with the same "cover" math as the video so each hotspot stays glued to
// its slab at any viewport aspect ratio.
const AR = 1924 / 1076;

type Slab = { label: string; hint: string; href: string; left: number; top: number; width: number; height: number };

const SLABS: Slab[] = [
  { label: 'Мрамор', hint: 'Калакатта, статуарио, оникс', href: '/catalog/pod-mramor', left: 23.4, top: 16.1, width: 13.6, height: 57.1 },
  { label: 'Бетон', hint: 'Микроцемент и лофт', href: '/catalog/pod-beton', left: 37.1, top: 17.2, width: 8.3, height: 55.5 },
  { label: 'Дерево', hint: 'Дуб, орех, ясень', href: '/catalog/pod-derevo', left: 45.5, top: 18.2, width: 7.7, height: 54.1 },
  { label: 'Тёмный камень', hint: 'Сланец, гранит, базальт', href: '/catalog/pod-kamen', left: 53.3, top: 19.6, width: 7.2, height: 52.5 },
  { label: 'Светлый камень', hint: 'Травертин и известняк', href: '/catalog/pod-kamen', left: 60.5, top: 21, width: 6.6, height: 50.6 },
];

const ease = [0.23, 1, 0.32, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [px, py, reduce]);

  // Some browsers ignore autoplay after client-side hydration — nudge playback
  // explicitly, and retry on the first user gesture.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener('canplay', tryPlay);
    const onInteract = () => {
      if (v.paused) tryPlay();
    };
    window.addEventListener('pointerdown', onInteract, { once: true });
    return () => {
      v.removeEventListener('canplay', tryPlay);
      window.removeEventListener('pointerdown', onInteract);
    };
  }, []);

  const stageX = useTransform(sx, [-1, 1], [14, -14]);
  const stageY = useTransform(sy, [-1, 1], [9, -9]);
  const lightX = useTransform(sx, [-1, 1], [-40, 40]);
  const lightY = useTransform(sy, [-1, 1], [-28, 28]);

  const cover = {
    width: `max(100vw, calc(100svh * ${AR}))`,
    height: `max(100svh, calc(100vw / ${AR}))`,
  } as const;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
      {/* video + hotspots share one transformed stage so they never drift apart */}
      <motion.div
        className="hero-scene absolute left-1/2 top-1/2 will-change-transform"
        style={{ ...cover, translateX: '-50%', translateY: '-50%', x: reduce ? 0 : stageX, y: reduce ? 0 : stageY, scale: 1.05 }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero/hero-showroom.mp4"
          poster="/hero/hero-showroom.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
        />

        {/* spotlight: a hole whose huge shadow dims the rest of the room; it
            glides between slabs so moving across the rack feels continuous */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-[3px]"
          initial={false}
          animate={
            active === null
              ? { opacity: 0 }
              : {
                  opacity: 1,
                  left: `${SLABS[active].left}%`,
                  top: `${SLABS[active].top}%`,
                  width: `${SLABS[active].width}%`,
                  height: `${SLABS[active].height}%`,
                }
          }
          transition={{
            opacity: { duration: active === null ? 0.25 : 0.3, ease },
            default: reduce ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.12 },
          }}
          style={{
            left: `${SLABS[0].left}%`,
            top: `${SLABS[0].top}%`,
            width: `${SLABS[0].width}%`,
            height: `${SLABS[0].height}%`,
            boxShadow: '0 0 0 200vmax rgba(20,20,20,0.42), inset 0 0 0 1px rgba(255,255,255,0.5)',
          }}
        />

        <div className="absolute inset-0 hidden [@media(hover:hover)_and_(pointer:fine)]:block" onPointerLeave={() => setActive(null)}>
          {SLABS.map((s, i) => (
            <Link
              key={s.label}
              href={s.href}
              aria-label={`${s.label} — открыть каталог`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="absolute block overflow-hidden outline-none"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, height: `${s.height}%` }}
            >
              {/* light sweep across the focused slab */}
              <span aria-hidden className={`hero-sheen absolute inset-0 ${active === i ? 'is-on' : ''}`} />
            </Link>
          ))}
        </div>

        {/* label for the focused slab */}
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={active}
              className="pointer-events-none absolute z-10"
              style={{ left: `${SLABS[active].left + SLABS[active].width / 2}%`, top: `${SLABS[active].top}%` }}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 4, filter: 'blur(4px)', transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease }}
            >
              <div className="-translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-full bg-paper/95 py-2 pl-4 pr-3 text-ink shadow-float backdrop-blur">
                <span className="text-[13px] font-semibold">{SLABS[active].label}</span>
                <span className="mx-2 text-ink-faint">·</span>
                <span className="text-[12px] text-ink-soft">{SLABS[active].hint}</span>
                <span className="ml-2 inline-grid h-6 w-6 place-items-center rounded-full bg-ink text-paper">
                  <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden>
                    <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" />
                  </svg>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* dynamic light that follows the cursor */}
      <motion.div
        aria-hidden
        className="hero-scene pointer-events-none absolute inset-0 mix-blend-soft-light will-change-transform"
        style={{
          x: reduce ? 0 : lightX,
          y: reduce ? 0 : lightY,
          background: 'radial-gradient(50% 45% at 62% 26%, rgba(255,243,222,0.45), rgba(255,243,222,0) 70%)',
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/5 to-transparent" />
      <div aria-hidden className="hero-curtain pointer-events-none absolute inset-0 bg-ink" />

      <div className="container-x pointer-events-none relative flex h-full flex-col justify-end pb-[12vh] pt-[var(--header-h)]">
        <p className="hero-fade text-[11px] font-medium uppercase tracking-brand text-white/70" style={{ animationDelay: '0.5s' }}>
          A3 FOR YOU · Бишкек
        </p>
        <h1
          className="hero-fade mt-5 max-w-4xl text-balance font-semibold leading-[1.03] tracking-[-0.02em] text-white"
          style={{ fontSize: 'clamp(2.5rem, 6.4vw, 5rem)', animationDelay: '0.6s' }}
        >
          Керамогранит под любой интерьер и&nbsp;бюджет
        </h1>
        <p className="hero-fade mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/80" style={{ animationDelay: '0.7s' }}>
          От доступных решений на каждый день до коллекций, которые невозможно забыть. Сотни декоров под мрамор, камень,
          дерево и бетон — поможем выбрать свой.
        </p>
        <div className="hero-fade pointer-events-auto mt-9 flex flex-wrap gap-3" style={{ animationDelay: '0.8s' }}>
          <Link href="/catalog" className="btn bg-paper text-ink hover:bg-white">
            Подобрать керамогранит
          </Link>
          <Link href="/configurator" className="btn border border-white/40 text-white hover:border-white hover:bg-white/10">
            Создать свой интерьер
          </Link>
        </div>
      </div>

      <div className="hero-fade pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block" style={{ animationDelay: '1.4s' }}>
        <span className="hero-bob block text-[10px] uppercase tracking-brand text-white/60">Листайте</span>
      </div>
    </section>
  );
}
