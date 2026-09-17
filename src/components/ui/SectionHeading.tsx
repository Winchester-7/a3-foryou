import type { ReactNode } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';

export function SectionHeading({
  eyebrow,
  title,
  text,
  link,
  align = 'left',
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  link?: { href: string; label: string };
  align?: 'left' | 'center';
}) {
  return (
    <Reveal>
      <div
        className={`flex flex-col gap-5 ${
          align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
        }`}
      >
        <div className={align === 'center' ? 'max-w-2xl' : 'max-w-2xl'}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="h-section mt-3 text-balance">{title}</h2>
          {text && <p className="mt-4 max-w-prose2 text-[15px] leading-relaxed text-ink-soft">{text}</p>}
        </div>
        {link && (
          <Link href={link.href} className="btn-outline shrink-0 self-start md:self-auto">
            {link.label}
          </Link>
        )}
      </div>
    </Reveal>
  );
}
