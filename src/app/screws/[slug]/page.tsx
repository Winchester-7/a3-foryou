/** @author Erbol king */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { FurnitureDetail } from '@/components/furniture/FurnitureDetail';
import { getScrews, getScrew, screwPrice } from '@/lib/screws';
import { site } from '@/lib/site';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getScrew(params.slug);
  if (!s) return {};
  return {
    title: `${s.name} — ${s.kind}`,
    description: s.description || `${s.name}: ${s.kind.toLowerCase()} в Бишкеке. ${screwPrice(s)}.`,
    alternates: { canonical: `/screws/${s.slug}` },
    openGraph: { title: `${s.name} — ${site.name}`, images: s.image ? [s.image] : [] },
  };
}

export default function ScrewPage({ params }: { params: { slug: string } }) {
  const s = getScrew(params.slug);
  if (!s) notFound();

  const related = getScrews().filter((x) => x.kind === s.kind && x.slug !== s.slug).slice(0, 3);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: s.name,
            category: s.kind,
            description: s.description,
            image: s.gallery,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'KGS',
              ...(s.price > 0 ? { price: s.price } : {}),
              availability: 'https://schema.org/InStock',
              url: `${site.url}/screws/${s.slug}`,
            },
          }),
        }}
      />
      <Breadcrumbs items={[{ label: 'Каталог', href: '/catalog' }, { label: 'Шурупы', href: '/screws' }, { label: s.name }]} />
      <FurnitureDetail
        kicker={`Крепёж · ${s.kind}`}
        title={s.name}
        subtitle="В наличии на складе в Бишкеке"
        description={s.description}
        priceLabel={screwPrice(s)}
        colors={[]}
        colorLabel=""
        sizes={[]}
        specs={s.specs}
        gallery={s.gallery}
        requestSubject={s.name}
      />

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-14">
          <div className="container-x">
            <h2 className="h-section">Ещё: {s.kind.toLowerCase()}</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((x) => (
                <Link key={x.slug} href={`/screws/${x.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={x.image} alt={x.name} loading="lazy" className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]" />
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
