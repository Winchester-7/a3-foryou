/** @author Erbol king */
import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';

export function PageHeader({ title, text, children }: { title: string; text?: ReactNode; children?: ReactNode }) {
  return (
    <header className="container-x py-8 lg:py-12">
      <Reveal>
        <h1 className="h-display max-w-4xl text-balance">{title}</h1>
        {text && <p className="mt-5 max-w-prose2 text-[15px] leading-relaxed text-ink-soft">{text}</p>}
        {children}
      </Reveal>
    </header>
  );
}
