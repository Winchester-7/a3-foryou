import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { FurnitureCatalog, type FurnitureItem } from '@/components/furniture/FurnitureCatalog';
import { sofaModels } from '@/lib/sofas';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Диваны — мягкая мебель Delavega',
  description:
    'Каталог диванов и кресел Delavega в Бишкеке: каркас из массива бука, гипоаллергенные наполнители, обивочная ткань на выбор, изготовление по индивидуальному размеру, гарантия 10 лет.',
  alternates: { canonical: '/sofas' },
};

export default function SofasPage() {
  const items: FurnitureItem[] = sofaModels.map((s) => ({
    slug: s.slug,
    name: `${s.kind} ${s.name}`,
    image: s.image,
    tag: s.kind,
    meta: `${s.sizes[0]} см · ткань на выбор`,
    colors: s.fabrics.slice(0, 5).map((f) => ({ hex: f.hex })),
  }));

  return (
    <PageShell>
      <CategoryBanner
        eyebrow="Интерьер и мебель"
        title="Диваны и кресла"
        text="Мягкая мебель фабрики-ателье Delavega: каркас из массива бука и влагостойкой фанеры, болтовое крепление, гипоаллергенные европейские наполнители, износостойкие ткани 100 000 циклов. Изготовление по индивидуальным размерам, гарантия 10 лет на каркас и наполнитель."
        src={sofaModels[0]?.hero ?? '/sofas/p010_0.jpg'}
        stats={[
          { value: String(sofaModels.length), label: 'моделей' },
          { value: '10 лет', label: 'гарантия' },
          { value: 'по размеру', label: 'изготовление' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Интерьер и мебель', href: '/interior' }, { label: 'Диваны' }]} flush />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Диваны и кресла Delavega',
            url: `${site.url}/sofas`,
          }),
        }}
      />

      <FurnitureCatalog items={items} basePath="/sofas" filterLabel="Тип" />
    </PageShell>
  );
}
