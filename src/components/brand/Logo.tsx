'use client';

/** @author Erbol king */

import Link from 'next/link';
import { LogoMark } from './LogoMark';

export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  const sub = tone === 'light' ? 'rgba(255,255,255,0.72)' : '#8A8A8A';
  return (
    <Link href="/" aria-label="A3 FOR YOU — на главную" className={`logo-link group inline-flex items-end gap-2.5 ${className ?? ''}`}>
      <LogoMark tone={tone} height={36} />
      <span className="mb-[3px] text-[9px] font-semibold uppercase leading-none tracking-brand transition-colors duration-300" style={{ color: sub }}>
        For&nbsp;You
      </span>
    </Link>
  );
}
