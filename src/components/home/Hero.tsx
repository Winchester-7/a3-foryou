'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import slabData from '@/lib/hero-slabs.json';

const ease = [0.22, 1, 0.36, 1] as const;

type SlabMeta = { i: number; left: number; top: number; width: number; height: number };
const DATA = slabData as unknown as { scene: number[]; slabs: SlabMeta[] };
const SLABS: SlabMeta[] = DATA.slabs;
const AR = DATA.scene[0] / DATA.scene[1];

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 55, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 55, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
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

  // Some browsers ignore the autoplay attribute after client-side hydration,
  // or briefly reject it before the element is fully ready — nudge playback
  // explicitly (and retry on the first user gesture, just in case) so the
  // live background never gets stuck paused.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener('loadedmetadata', tryPlay);
    v.addEventListener('canplay', tryPlay);

    const onInteract = () => {
      if (v.paused) tryPlay();
    };
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      v.removeEventListener('loadedmetadata', tryPlay);
      v.removeEventListener('canplay', tryPlay);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  const bgX = useTransform(sx, [-1, 1], [12, -12]);
  const bgY = useTransform(sy, [-1, 1], [8, -8]);
  const sceneX = useTransform(sx, [-1, 1], [26, -26]);
  const sceneY = useTransform(sy, [-1, 1], [16, -16]);
  const rotX = useTransform(sy, [-1, 1], [2, -2]);
  const rotY = useTransform(sx, [-1, 1], [-2.4, 2.4]);
  const lightX = useTransform(sx, [-1, 1], [-38, 38]);
  const lightY = useTransform(sy, [-1, 1], [-28, 28]);
  const slabX = useTransform(sx, [-1, 1], [-16, 16]);
  const slabY = useTransform(sy, [-1, 1], [-10, 10]);

  const cover = {
    width: `max(100vw, calc(100svh * ${AR}))`,
    height: `max(100svh, calc(100vw / ${AR}))`,
  } as const;

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink [perspective:1400px]">
      {/* live video background — replaces the previous static hero image */}
      <motion.div
        className="hero-scene absolute inset-0 will-change-transform"
        style={{ x: reduce ? 0 : bgX, y: reduce ? 0 : bgY, scale: 1.06 }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/hero/hero-bg.mp4"
          poster="/hero/keramo-scene.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
        />
      </motion.div>

      {/* light, even darkening for text legibility over moving footage */}
      <div className="pointer-events-none absolute inset-0 bg-ink/20" />

      {/* scene stage — positions the interactive keramogranit slabs over the video */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform [transform-style:preserve-3d]"
        style={{
          ...cover,
          x: reduce ? 0 : sceneX,
          y: reduce ? 0 : sceneY,
          rotateX: reduce ? 0 : rotX,
          rotateY: reduce ? 0 : rotY,
        }}
      >
        <div className="hero-scene hero-zoom relative h-full w-full">
          <motion.div className="absolute inset-0 will-change-transform" style={{ x: reduce ? 0 : slabX, y: reduce ? 0 : slabY }}>
            {SLABS.map((s, idx) => (
              <motion.div
                key={s.i}
                className="group absolute [transform-style:preserve-3d]"
                style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%`, height: `${s.height}%` }}
                whileHover={
                  reduce
                    ? undefined
                    : { z: 42, y: 16, scale: 1.015, transition: { duration: 0.5, ease } }
                }
                transition={{ duration: 0.5, ease }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/hero/slab${s.i}.png`}
                  alt=""
                  className="hero-slab filter drop-shadow-[0_22px_38px_rgba(0,0,0,0.26)] transition-[filter] duration-500 ease-premium group-hover:contrast-[1.08] group-hover:saturate-[1.06] group-hover:brightness-[1.04] group-hover:drop-shadow-[0_38px_66px_rgba(0,0,0,0.42)] h-full w-full object-fill"
                  style={{ animationDelay: `${0.4 + idx * 0.15}s` }}
                />
                {/* soft reflected edge light */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(115deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.18) 100%)',
                    mixBlendMode: 'overlay',
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* dynamic light */}
      <motion.div
        aria-hidden
        className="hero-scene pointer-events-none absolute inset-0 mix-blend-soft-light will-change-transform"
        style={{
          x: reduce ? 0 : lightX,
          y: reduce ? 0 : lightY,
          background: 'radial-gradient(50% 45% at 62% 26%, rgba(255,243,222,0.5), rgba(255,243,222,0) 70%)',
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/10 to-transparent" />
      <div aria-hidden className="hero-curtain pointer-events-none absolute inset-0 bg-ink" />

      <div className="container-x relative flex h-full flex-col justify-end pb-[12vh] pt-[var(--header-h)] pointer-events-none">
        <p className="hero-fade text-[11px] font-medium uppercase tracking-brand text-white/70" style={{ animationDelay: '1.2s' }}>
          A3 FOR YOU — керамогранит и материалы для интерьера
        </p>
        <h1
          className="hero-fade mt-5 max-w-4xl text-balance font-semibold leading-[1.03] tracking-[-0.02em] text-white"
          style={{ fontSize: 'clamp(2.5rem, 6.4vw, 5rem)', animationDelay: '1.35s' }}
        >
          Премиальный керамогранит для современных интерьеров
        </h1>
        <p className="hero-fade mt-5 max-w-xl text-lg text-white/80" style={{ animationDelay: '1.5s' }}>
          Коллекции под дерево, камень, бетон и мрамор
        </p>
        <div className="hero-fade pointer-events-auto mt-9 flex flex-wrap gap-3" style={{ animationDelay: '1.65s' }}>
          <Link href="/catalog" className="btn bg-paper text-ink transition-transform hover:-translate-y-0.5 hover:bg-white hover:shadow-float">
            Перейти в каталог
          </Link>
          <Link href="/configurator" className="btn border border-white/40 text-white transition-transform hover:-translate-y-0.5 hover:border-white">
            Создать свой интерьер
          </Link>
        </div>
      </div>

      <div className="hero-fade pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block" style={{ animationDelay: '2.2s' }}>
        <span className="hero-bob block text-[10px] uppercase tracking-brand text-white/60">Листайте</span>
      </div>
    </section>
  );
}
