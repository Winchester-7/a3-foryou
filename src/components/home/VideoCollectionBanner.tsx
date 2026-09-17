'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Wide, full-bleed cinematic video banner for a single spotlighted collection —
 * placed between catalog sections, in the spirit of Atlas Concorde / Florim /
 * Porcelanosa collection presentations. The video is only mounted once the
 * banner nears the viewport (lazy-loaded), so it never competes with the
 * hero video or above-the-fold content for bandwidth.
 */
export function VideoCollectionBanner({
  src,
  eyebrow,
  title,
  text,
  href,
  cta = 'Смотреть коллекцию',
}: {
  src: string;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '500px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Reveal>
      <div
        ref={ref}
        className="relative isolate h-[62vh] min-h-[440px] max-h-[720px] w-full overflow-hidden bg-ink"
      >
        {inView && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
          />
        )}

        {/* 20% darkening for legibility, per spec */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />

        <div className="container-x relative flex h-full flex-col justify-end pb-14 lg:pb-16">
          <p className="text-[11px] font-medium uppercase tracking-brand text-white/70">{eyebrow}</p>
          <h2
            className="mt-3 max-w-2xl text-balance font-semibold leading-[1.05] tracking-[-0.02em] text-white"
            style={{ fontSize: 'clamp(2rem, 4.2vw, 3.4rem)' }}
          >
            {title}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80">{text}</p>
          <Link
            href={href}
            className="btn mt-7 w-fit bg-paper text-ink transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-float"
          >
            {cta}
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
