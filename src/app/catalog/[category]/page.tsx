/** @author Erbol king */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { DirectionView, type DirectionItem } from '@/components/catalog/DirectionView';
import { getCategory, getCategoryCollections, getCollection, buildFacets, getFallbackHero } from '@/lib/catalog';
import { site } from '@/lib/site';

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const cat = getCategory(params.category);
  if (!cat) return {};
  return {
    title: cat.title,
    description: `${cat.title} в Бишкеке — ${cat.description}`,
    alternates: { canonical: `/catalog/${cat.slug}` },
    openGraph: { title: `${cat.title} — ${site.name}`, description: cat.tagline },
  };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const list = getCategoryCollections(cat.slug);
  const facets = buildFacets(list);
  const hero = getCollection(cat.heroCollection)?.hero || getFallbackHero();
  const decorCount = list.reduce((n, c) => n + c.products.length, 0);
  const sizes = new Set(list.flatMap((c) => c.sizes)).size;
  const items: DirectionItem[] = list.flatMap((c) =>
    c.products.map((product) => ({ product, collection: { slug: c.slug, brand: c.brand, nameRu: c.nameRu, name: c.name } })),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.title,
    description: cat.description,
    url: `${site.url}/catalog/${cat.slug}`,
    hasPart: list.slice(0, 20).map((c) => ({
      '@type': 'Product',
      name: `${c.nameRu} (${c.name})`,
      url: `${site.url}/collection/${c.slug}`,
    })),
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CategoryBanner
        eyebrow="Каталог керамогранита"
        title={cat.title}
        text={cat.description}
        src={hero}
        stats={[
          { value: String(list.length), label: 'коллекций' },
          { value: String(decorCount), label: 'декоров' },
          { value: String(sizes), label: 'форматов' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Каталог', href: '/catalog' }, { label: cat.menuTitle }]} flush />
      <DirectionView items={items} facets={facets} />
    </PageShell>
  );
}
