/** @author Erbol king */
import type { Metadata } from 'next';
import { plural } from '@/lib/color';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CatalogView } from '@/components/catalog/CatalogView';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DirectionGrid } from '@/components/catalog/DirectionGrid';
import { getCollections, buildFacets, getAllProducts } from '@/lib/catalog';
import { BrandLogo } from '@/components/brand/BrandLogo';

export const metadata: Metadata = {
  title: 'Каталог керамогранита',
  description:
    'Каталог керамогранита A3 FOR YOU в Бишкеке: только то, что есть на складе — IDALGO, GRANITEA, KERRANOVA, GRASARO и другие заводы.',
  alternates: { canonical: '/catalog' },
};

export default function CatalogPage() {
  const collections = getCollections();
  const allProducts = getAllProducts();
  const facets = buildFacets(collections);

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Каталог' }]} />

      <div className="container-x pb-4 pt-8">
        <h1 className="h-display max-w-3xl text-balance">Каталог керамогранита</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          {collections.length} {plural(collections.length, 'коллекция', 'коллекции', 'коллекций')} и {allProducts.length} {plural(allProducts.length, 'декор', 'декора', 'декоров')} — всё есть у нас в наличии.
          Фильтруйте по типу поверхности, бренду, размеру и области применения.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          <BrandLogo brand="idalgo" height={26} />
          <BrandLogo brand="granitea" height={26} />
          <BrandLogo brand="uralgranit" height={26} />
          <BrandLogo brand="kerranova" height={26} />
          <BrandLogo brand="grasaro" height={26} />
        </div>
      </div>

      <section className="container-x py-10">
        <SectionHeading eyebrow="Направления" title="Выберите направление" />
        <div className="mt-10">
          <DirectionGrid />
        </div>
      </section>

      <div id="vse-kollekcii" className="scroll-mt-24 border-t border-line">
        <div className="container-x pt-12">
          <SectionHeading eyebrow="Все коллекции" title="Полный ассортимент" />
        </div>
        <CatalogView collections={collections} facets={facets} />
      </div>
    </PageShell>
  );
}
