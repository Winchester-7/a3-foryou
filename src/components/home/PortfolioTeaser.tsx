/** @author Erbol king */
import Image from 'next/image';
import Link from 'next/link';
import { getPortfolio } from '@/lib/portfolio';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function PortfolioTeaser() {
  const portfolio = getPortfolio();
  if (portfolio.length === 0) return null;

  return (
    <section className="container-x py-20 lg:py-28">
      <SectionHeading
        title="Как коллекции выглядят в интерьере"
        text="Фотографии плитки из нашего каталога в готовых комнатах — так проще представить её у себя."
        link={{ href: '/portfolio', label: 'Смотреть все' }}
      />

      <div className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-3">
        {portfolio.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/portfolio/${p.slug}`} className="group block">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-surface">
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 90vw, 30vw"
                  className="object-cover transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-4 text-sm text-ink-faint">{p.kind}</p>
              <h3 className="mt-2 text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                {p.title}
              </h3>
              {p.subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.subtitle}</p>}
            </Link>
        ))}
      </div>
    </section>
  );
}
