'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export function Logo({
  tone = 'dark',
  className,
}: {
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ink = tone === 'light' ? '#FFFFFF' : '#232323';
  const sub = tone === 'light' ? 'rgba(255,255,255,0.72)' : '#8A8A8A';

  return (
    <Link
      href="/"
      aria-label="A3 FOR YOU — на главную"
      className={`group inline-flex items-center gap-3 ${className ?? ''}`}
    >
      <motion.span
        className="relative block will-change-transform"
        whileHover={reduce ? undefined : { scale: 1.05 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-xl transition-opacity duration-300 ease-premium group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(224,36,27,0.35), transparent 70%)' }}
        />
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="relative">
          <path d="M2.5 33.5 L18.5 4 L24 4 L8 33.5 Z" fill="#E0241B" />
          <path d="M20 12 L32.5 33.5 L27 33.5 L17.2 16.6 Z" fill={ink} />
          <g fill={ink}>
            <rect x="15.6" y="21" width="4.4" height="4.4" rx="0.9" />
            <rect x="21.4" y="21" width="4.4" height="4.4" rx="0.9" />
            <rect x="15.6" y="26.6" width="4.4" height="4.4" rx="0.9" />
            <rect x="21.4" y="26.6" width="4.4" height="4.4" rx="0.9" />
          </g>
        </svg>
      </motion.span>

      <span className="flex flex-col leading-none">
        <span className="text-[19px] font-extrabold tracking-[-0.01em]" style={{ color: ink }}>
          A3
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-brand" style={{ color: sub }}>
          For&nbsp;You
        </span>
      </span>
    </Link>
  );
}
