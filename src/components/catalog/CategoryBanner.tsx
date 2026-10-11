/** @author Erbol king */
import type { ReactNode } from 'react';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';

export function CategoryBanner({
  eyebrow,
  title,
  text,
  src,
  seed,
  stats,
}: {
  eyebrow: ReactNode;
  title: string;
  text: string;
  src?: string;
  seed?: string;
  stats?: { value: string; label: string }[];
}) {
  return (
    <section className="relative min-h-[420px] overflow-hidden lg:min-h-[520px]">
      <ParallaxImage
        src={src}
        seed={seed}
        alt={title}
        fill
        overlay="from-ink/85 via-ink/45 to-ink/55"
        strength={55}
        priority
      />
      <div className="container-x relative pb-16 pt-[calc(var(--header-h)+72px)] lg:pb-20 lg:pt-[calc(var(--header-h)+120px)]">
        <Reveal>
          <div className="text-[11px] font-medium uppercase tracking-brand text-white/65">{eyebrow}</div>
          <h1 className="mt-4 max-w-3xl text-balance font-semibold leading-[1.05] tracking-[-0.02em] text-white" style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.6rem)' }}>
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">{text}</p>
        </Reveal>
        {stats && (
          <Reveal delay={0.15}>
            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-semibold text-white">{s.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wide2 text-white/60">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
