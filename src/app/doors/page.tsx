import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { FurnitureCatalog, type FurnitureItem } from '@/components/furniture/FurnitureCatalog';
import { doorModels } from '@/lib/doors';
import { plural } from '@/lib/color';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Двери — межкомнатные двери Diford',
  description:
    'Каталог межкомнатных дверей Diford в Бишкеке: классика, неоклассика, лофт и минимализм. Глухие и остеклённые полотна, эмаль и софт-покрытия, изготовление по размеру.',
  alternates: { canonical: '/doors' },
};

export default function DoorsPage() {
  const items: FurnitureItem[] = doorModels.map((d) => ({
    slug: d.slug,
    name: d.name,
    image: d.image,
    tag: d.style,
    meta: `${d.types.join(' / ')} · ${d.colors.length} ${plural(d.colors.length, 'цвет', 'цвета', 'цветов')}`,
    colors: d.colors.map((c) => ({ hex: c.hex })),
  }));

  return (
    <PageShell>
      <CategoryBanner
        eyebrow="Интерьер и мебель"
        title="Межкомнатные двери"
        text="Двери фабрики Diford: филёнчатая классика, рифлёная неоклассика, лофт и гладкий минимализм. Глухие и остеклённые полотна, покрытие эмаль / ПВХ / полипропилен, скрытые петли, изготовление по индивидуальному размеру."
        src={doorModels[0]?.hero ?? '/doors/p03_lt.jpg'}
        stats={[
          { value: String(doorModels.length), label: 'моделей' },
          { value: '40 мм', label: 'толщина полотна' },
          { value: 'по размеру', label: 'изготовление' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Интерьер и мебель', href: '/interior' }, { label: 'Двери' }]} flush />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Межкомнатные двери Diford',
            url: `${site.url}/doors`,
          }),
        }}
      />

      <FurnitureCatalog items={items} basePath="/doors" filterLabel="Стиль" />
    </PageShell>
  );
}
