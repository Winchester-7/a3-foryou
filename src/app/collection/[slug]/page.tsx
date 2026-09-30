import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Reveal } from '@/components/motion/Reveal';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';
import { collections, getCollection, getLook, brandName, PRICE_LABEL } from '@/lib/catalog';
import { TECH_SPECS } from '@/lib/specs';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCollection(params.slug);
  if (!c) return {};
  return {
    title: `${c.nameRu} (${c.name}) — ${brandName(c.brand)}`,
    description: c.description,
    alternates: { canonical: `/collection/${c.slug}` },
    openGraph: { title: `${c.nameRu} — ${site.name}`, description: c.tagline, images: [c.hero] },
  };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = getCollection(params.slug);
  if (!collection) notFound();

  const look = getLook(collection.look)!;
  const items = collection.products.map((product) => ({ product, collection }));
  const related = collections
    .filter((c) => c.look === collection.look && c.slug !== collection.slug)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name: `${collection.nameRu} (${collection.name})`,
    description: collection.description,
    brand: { '@type': 'Brand', name: brandName(collection.brand) },
    url: `${site.url}/collection/${collection.slug}`,
    hasVariant: collection.products.map((p) => ({
      '@type': 'Product',
      name: p.nameRu,
      sku: p.article,
      url: `${site.url}/product/${p.slug}`,
      offers: { '@type': 'Offer', priceCurrency: 'KGS', availability: 'https://schema.org/InStock' },
    })),
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CategoryBanner
        eyebrow={`${brandName(collection.brand)} · ${look.title}`}
        title={`${collection.nameRu} · ${collection.name}`}
        text={collection.description}
        src={collection.hero}
        stats={[
          { value: String(collection.products.length), label: 'декоров' },
          { value: collection.sizes.join(' · '), label: 'форматы, см' },
          { value: collection.thickness, label: 'толщина' },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: 'Каталог', href: '/catalog' },
          { label: look.short, href: `/catalog/${lookToCategory(collection.look)}` },
          { label: collection.nameRu },
        ]}
        flush
      />

      <section className="container-x py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Характеристики коллекции</p>
              <dl className="mt-5 divide-y divide-line border-y border-line">
                <Spec label="Бренд">{brandName(collection.brand)}</Spec>
                <Spec label="Тип">{look.title}</Spec>
                <Spec label="Форматы">{collection.sizes.join(', ')} см{collection.formatNote ? ` · ${collection.formatNote}` : ''}</Spec>
                <Spec label="Толщина">{collection.thickness}</Spec>
                <Spec label="Поверхности">{collection.surfaces.join(', ')}</Spec>
                <Spec label="Край">Ректифицированный</Spec>
                <Spec label="Применение">{collection.applications.join(', ')}</Spec>
              </dl>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {TECH_SPECS.slice(0, 3).map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-surface p-4">
                    <p className="text-lg font-semibold text-ink">{v}</p>
                    <p className="mt-1 text-xs text-ink-faint">{k}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-line p-6">
              <p className="text-sm font-medium text-ink">{PRICE_LABEL}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Рассчитаем стоимость коллекции «{collection.nameRu}» под ваш объём, подберём раскладку и
                проверим наличие на складе в Бишкеке.
              </p>
              <CallbackTrigger kind="request" subject={`Коллекция ${collection.nameRu}`} label="Запросить цену" className="btn-accent mt-5 w-full" />
              <a href={site.whatsapp} target="_blank" rel="noreferrer noopener" className="btn-outline mt-3 w-full">
                Написать в WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-surface py-14 lg:py-20">
        <div className="container-x">
          <h2 className="h-section">Декоры коллекции</h2>
          <p className="mt-3 text-sm text-ink-soft">{collection.products.length} вариантов рисунка и цвета</p>
          <div className="mt-10">
            <ProductGrid items={items} />
          </div>
        </div>
      </section>

      {collection.gallery.length > 0 && (
        <section className="container-x py-16 lg:py-24">
          <h2 className="h-section">В интерьере</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collection.gallery.slice(0, 6).map((src, i) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${collection.nameRu} — интерьер ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-14">
          <div className="container-x">
            <h2 className="h-section">Другие коллекции {look.short.toLowerCase()}</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((c) => (
                <Link key={c.slug} href={`/collection/${c.slug}`} className="group block">
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-surface2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.hero} alt={c.nameRu} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]" />
                  </div>
                  <p className="mt-3 text-base font-medium text-ink transition-colors group-hover:text-accent">{c.nameRu}</p>
                  <p className="text-xs text-ink-faint">{c.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}

function lookToCategory(look: string): string {
  return (
    { marble: 'pod-mramor', stone: 'pod-kamen', wood: 'pod-derevo', loft: 'loft', concrete: 'pod-beton', facade: 'dlya-fasadov', technical: 'dlya-fasadov' } as Record<string, string>
  )[look] ?? 'pod-mramor';
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-3.5 text-sm">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
