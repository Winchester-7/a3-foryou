'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Reveal strategy — content is VISIBLE by default (SSR + first paint).
 * After mount we only hide it if it is safely below the fold, then reveal
 * it on scroll-in. A safety timeout guarantees it can never stay hidden,
 * even if IntersectionObserver / rAF is unavailable (e.g. background tab).
 */
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  // 'show' by default so nothing depends on JS to be visible.
  const [state, setState] = useState<'show' | 'hidden'>('show');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const belowFold = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top > vh * 0.9;
    };

    if (!belowFold()) return; // already visible area — leave it shown

    setState('hidden');

    let io: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('show');
          io?.disconnect();
          io = null;
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    );
    io.observe(el);

    const onScroll = () => {
      if (!belowFold()) {
        setState('show');
        io?.disconnect();
        io = null;
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const safety = window.setTimeout(() => {
      setState('show');
      io?.disconnect();
      io = null;
    }, 1600);

    return () => {
      io?.disconnect();
      window.clearTimeout(safety);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return { ref, state };
}

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const { ref, state } = useReveal();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={
        state === 'show'
          ? { opacity: 1, y: 0 }
          : reduce
            ? { opacity: 0 }
            : { opacity: 0, y }
      }
      transition={{ duration: 0.7, ease, delay: state === 'show' ? delay : 0 }}
    >
      {children}
    </motion.div>
  );
}

const parent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, state } = useReveal();
  return (
    <motion.div ref={ref} className={className} variants={parent} initial={false} animate={state}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}
