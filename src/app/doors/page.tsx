/** @author Erbol king */
import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { FurnitureCatalog, type FurnitureItem } from '@/components/furniture/FurnitureCatalog';
import { doorKindLabel, getDoors } from '@/lib/doors';
import { site } from '@/lib/site';
import { getFallbackHero, getCollection } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Двери — межкомнатные и входные',
  description:
    'Каталог межкомнатных и входных дверей в Бишкеке: классика, современные стили, глухие и остеклённые полотна, разные цвета и размеры.',
  alternates: { canonical: '/doors' },
};

export default function DoorsPage() {
  const doorModels = getDoors();
  const items: FurnitureItem[] = doorModels.map((d) => ({
    slug: d.slug,
    name: d.name,
    image: d.image,
    tag: d.style || d.brand,
    group: d.kind === 'entrance' ? 'Входные' : 'Межкомнатные',
    meta: [d.brand, d.colors[0]?.name].filter(Boolean).join(' · ') || doorKindLabel(d),
    colors: d.colors.map((c) => ({ hex: c.hex })),
  }));

  return (
    <PageShell>
      <CategoryBanner
        eyebrow="Каталог"
        title="Двери"
        text="Межкомнатные и входные двери: глухие и остеклённые полотна, десятки цветов и покрытий, стандартные размеры и изготовление под проём."
        src={getCollection('lusso')?.hero || getFallbackHero()}
        stats={[
          { value: String(doorModels.length), label: 'моделей' },
          { value: String(doorModels.filter((d) => d.kind !== 'entrance').length), label: 'межкомнатных' },
          { value: String(doorModels.filter((d) => d.kind === 'entrance').length), label: 'входных' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Каталог', href: '/catalog' }, { label: 'Двери' }]} flush />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Двери',
            url: `${site.url}/doors`,
          }),
        }}
      />

      <FurnitureCatalog items={items} basePath="/doors" filterLabel="Стиль" fit="contain" />
    </PageShell>
  );
}
