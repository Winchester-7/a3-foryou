/** @author Erbol king */
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { getPortfolio } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Портфолио',
  description: 'Интерьеры и объекты с керамогранитом A3 FOR YOU: гостиные, кухни, ванные, террасы и коммерческие пространства.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioPage() {
  const portfolio = getPortfolio();
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Портфолио' }]} />
      <PageHeader
        title="Портфолио"
        text="Интерьеры и объекты, в которых работает наш керамогранит — от жилых комнат до общественных пространств."
      />

      <section className="container-x pb-20">
        <StaggerGroup className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((p) => (
            <StaggerItem key={p.slug}>
              <Link href={`/portfolio/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 31vw"
                    className="object-cover transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-4 text-xs uppercase tracking-wide2 text-ink-faint">{p.kind}</p>
                <h2 className="mt-2 text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                  {p.title}
                </h2>
                {p.subtitle && <p className="mt-1 text-sm text-ink-soft">{p.subtitle}</p>}
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </PageShell>
  );
}
