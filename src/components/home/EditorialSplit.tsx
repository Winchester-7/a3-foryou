import Link from 'next/link';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';

export function EditorialSplit({
  eyebrow,
  title,
  text,
  src,
  href,
  linkLabel,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  src: string;
  href: string;
  linkLabel: string;
  reverse?: boolean;
}) {
  return (
    <section className="container-x py-16 lg:py-24">
      <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <Reveal>
          <ParallaxImage
            src={src}
            alt={title}
            className="aspect-[4/3] rounded-3xl"
            strength={40}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="max-w-md">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="h-section mt-3">{title}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{text}</p>
            <Link href={href} className="link-underline mt-6 inline-flex text-sm font-medium uppercase tracking-wide2 text-ink">
              {linkLabel}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
