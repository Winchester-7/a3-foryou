import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FurnitureDetail } from '@/components/furniture/FurnitureDetail';
import { doorModels, getDoor } from '@/lib/doors';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return doorModels.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = getDoor(params.slug);
  if (!d) return {};
  return {
    title: `Дверь ${d.name} — ${d.style}`,
    description: `${d.name} (${d.brand}): ${d.description}`,
    alternates: { canonical: `/doors/${d.slug}` },
    openGraph: { title: `Дверь ${d.name} — ${site.name}`, images: [d.image] },
  };
}

export default function DoorPage({ params }: { params: { slug: string } }) {
  const d = getDoor(params.slug);
  if (!d) notFound();

  const related = doorModels.filter((x) => x.style === d.style && x.slug !== d.slug).slice(0, 3);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `Дверь ${d.name}`,
            brand: { '@type': 'Brand', name: d.brand },
            category: 'Межкомнатные двери',
            description: d.description,
            image: d.gallery,
            offers: { '@type': 'Offer', priceCurrency: 'KGS', availability: 'https://schema.org/InStock', url: `${site.url}/doors/${d.slug}` },
          }),
        }}
      />
      <Breadcrumbs
        items={[
          { label: 'Интерьер и мебель', href: '/interior' },
          { label: 'Двери', href: '/doors' },
          { label: d.name },
        ]}
      />
      <FurnitureDetail
        kicker={`${d.brand} · ${d.style}`}
        title={`Дверь ${d.name}`}
        subtitle={d.types.map((t) => (t === 'ДГ' ? 'глухая' : 'остеклённая')).join(' / ')}
        description={d.description}
        colors={d.colors.map((c) => ({ name: c.name, hex: c.hex, image: c.image }))}
        colorLabel="Цвет покрытия"
        sizes={d.sizes}
        specs={d.specs}
        gallery={d.gallery}
        requestSubject={`Дверь ${d.name}`}
      />

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-14">
          <div className="container-x">
            <h2 className="h-section">Ещё двери в стиле «{d.style.toLowerCase()}»</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((x) => (
                <Link key={x.slug} href={`/doors/${x.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.image} alt={x.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 text-base font-medium text-ink transition-colors group-hover:text-accent">{x.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
