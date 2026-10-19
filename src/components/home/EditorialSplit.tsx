/** @author Erbol king */
import Image from 'next/image';
import Link from 'next/link';

export function EditorialSplit({
  title,
  text,
  src,
  href,
  linkLabel,
  reverse = false,
}: {
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface">
          <Image src={src} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="max-w-md">
          <h2 className="h-section">{title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{text}</p>
          <Link href={href} className="link-underline mt-6 text-[15px] font-medium text-ink">
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
