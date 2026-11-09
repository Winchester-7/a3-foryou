/** @author Erbol king */
import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { FurnitureCatalog, type FurnitureItem } from '@/components/furniture/FurnitureCatalog';
import { getScrews, screwPrice } from '@/lib/screws';
import { getFallbackHero } from '@/lib/catalog';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Шурупы, саморезы и дюбели',
  description:
    'Крепёж для монтажа керамогранита, дверей и мебели в Бишкеке: саморезы, дюбели, гвозди. Цены и наличие на складе.',
  alternates: { canonical: '/screws' },
};

export default function ScrewsPage() {
  const screws = getScrews();
  const items: FurnitureItem[] = screws.map((s) => ({
    slug: s.slug,
    name: s.name,
    image: s.image,
    tag: s.kind,
    meta: screwPrice(s),
    colors: [],
  }));

  return (
    <PageShell>
      <CategoryBanner
        eyebrow="Крепёж"
        title="Шурупы, саморезы и дюбели"
        text="Всё для монтажа: саморезы, дюбели и гвозди для строительного пистолета. Заберите вместе с плиткой или дверью, чтобы не ехать в другой магазин."
        src={getFallbackHero()}
        stats={[
          { value: String(screws.length), label: 'позиций' },
          { value: 'в наличии', label: 'на складе в Бишкеке' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Каталог', href: '/catalog' }, { label: 'Шурупы' }]} flush />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Шурупы, саморезы и дюбели',
            url: `${site.url}/screws`,
          }),
        }}
      />

      <FurnitureCatalog items={items} basePath="/screws" filterLabel="Вид" fit="contain" />
    </PageShell>
  );
}
