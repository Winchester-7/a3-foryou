import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FurnitureDetail } from '@/components/furniture/FurnitureDetail';
import { sofaModels, getSofa } from '@/lib/sofas';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return sofaModels.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getSofa(params.slug);
  if (!s) return {};
  return {
    title: `${s.kind} ${s.name} — ${s.brand}`,
    description: `${s.kind} ${s.name} (${s.brand}): ${s.description}`,
    alternates: { canonical: `/sofas/${s.slug}` },
    openGraph: { title: `${s.kind} ${s.name} — ${site.name}`, images: [s.image] },
  };
}

export default function SofaPage({ params }: { params: { slug: string } }) {
  const s = getSofa(params.slug);
  if (!s) notFound();

  const related = sofaModels.filter((x) => x.kind === s.kind && x.slug !== s.slug).slice(0, 3);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${s.kind} ${s.name}`,
            brand: { '@type': 'Brand', name: s.brand },
            category: s.kind === 'Диван' ? 'Диваны' : 'Кресла',
            description: s.description,
            image: s.gallery,
            offers: { '@type': 'Offer', priceCurrency: 'KGS', availability: 'https://schema.org/InStock', url: `${site.url}/sofas/${s.slug}` },
          }),
        }}
      />
      <Breadcrumbs
        items={[
          { label: 'Интерьер и мебель', href: '/interior' },
          { label: 'Диваны', href: '/sofas' },
          { label: `${s.kind} ${s.name}` },
        ]}
      />
      <FurnitureDetail
        kicker={`${s.brand} · ${s.kind === 'Диван' ? 'Диваны' : 'Кресла'}`}
        title={`${s.kind} ${s.name}`}
        subtitle={`Каркас — массив бука · гарантия 10 лет`}
        description={s.description}
        colors={s.fabrics.map((f) => ({ name: f.name, hex: f.hex }))}
        colorLabel="Ткань обивки"
        sizes={s.sizes}
        specs={s.specs}
        gallery={s.gallery}
        requestSubject={`${s.kind} ${s.name}`}
      />

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-14">
          <div className="container-x">
            <h2 className="h-section">{s.kind === 'Диван' ? 'Другие диваны' : 'Другие кресла'}</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((x) => (
                <Link key={x.slug} href={`/sofas/${x.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.image} alt={x.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 text-base font-medium text-ink transition-colors group-hover:text-accent">{x.kind} {x.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
