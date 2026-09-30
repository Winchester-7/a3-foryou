import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Photo } from '@/components/media/Photo';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { news, formatDate } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Новости',
  description: 'Новости A3 FOR YOU: коллекции, события, технологии укладки керамогранита и тренды в отделке.',
  alternates: { canonical: '/news' },
};

export default function NewsPage() {
  const [lead, ...rest] = news;

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Новости' }]} />
      <PageHeader title="Новости" text="Коллекции, события шоурума и практические гиды по керамограниту." />

      <section className="container-x pb-20">
        <Link href={`/news/${lead.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-surface">
            <div className="h-full w-full transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
              <Photo seed={lead.imageSeed} width={900} height={600} alt={lead.title} sizes="(max-width: 1024px) 90vw, 45vw" className="h-full w-full object-cover" />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide2 text-ink-faint">
              {lead.category} · {formatDate(lead.date)}
            </p>
            <h2 className="h-section mt-3 group-hover:text-accent">{lead.title}</h2>
            <p className="mt-4 max-w-prose2 text-[15px] leading-relaxed text-ink-soft">{lead.excerpt}</p>
            <span className="link-underline mt-5 inline-flex text-sm font-medium uppercase tracking-wide2 text-ink">
              Читать
            </span>
          </div>
        </Link>

        <StaggerGroup className="mt-16 grid gap-x-6 gap-y-12 md:grid-cols-3">
          {rest.map((post) => (
            <StaggerItem key={post.slug}>
              <Link href={`/news/${post.slug}`} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-surface">
                  <div className="h-full w-full transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
                    <Photo seed={post.imageSeed} width={640} height={426} alt={post.title} sizes="(max-width: 768px) 90vw, 30vw" className="h-full w-full object-cover" />
                  </div>
                </div>
                <p className="mt-4 text-xs uppercase tracking-wide2 text-ink-faint">
                  {post.category} · {formatDate(post.date)}
                </p>
                <h3 className="mt-2 text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </PageShell>
  );
}
