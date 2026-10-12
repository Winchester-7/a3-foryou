/** @author Erbol king */
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CatalogView } from '@/components/catalog/CatalogView';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { TileImage } from '@/components/media/TileImage';
import { getCategories, getCollections, buildFacets, getAllProducts, getCollection, getFallbackHero } from '@/lib/catalog';
import { BrandLogo } from '@/components/brand/BrandLogo';

export const metadata: Metadata = {
  title: 'Каталог керамогранита',
  description:
    'Каталог керамогранита A3 FOR YOU в Бишкеке: только то, что есть на складе — IDALGO, GRANITEA, KERRANOVA, GRASARO и другие заводы.',
  alternates: { canonical: '/catalog' },
};

export default function CatalogPage() {
  const categories = getCategories();
  const collections = getCollections();
  const allProducts = getAllProducts();
  const FALLBACK_HERO = getFallbackHero();
  const facets = buildFacets(collections);

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Каталог' }]} />

      <div className="container-x pb-4 pt-8">
        <h1 className="h-display max-w-3xl text-balance">Каталог керамогранита</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          {collections.length} коллекций и {allProducts.length} декоров, которые есть у нас в наличии.
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
        <SectionHeading eyebrow="Категории" title="Выберите направление" />
        <StaggerGroup className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
          {categories.map((c) => {
            const hero = getCollection(c.heroCollection)?.hero || FALLBACK_HERO;
            return (
              <StaggerItem key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className="group block">
                  <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-surface">
                    <div className="absolute inset-0 transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
                      <TileImage src={hero} alt={c.title} sizes="(max-width: 768px) 50vw, 33vw" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
                    <span className="absolute inset-x-5 bottom-5 text-sm font-medium text-white">{c.menuTitle}</span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      <div className="border-t border-line">
        <div className="container-x pt-12">
          <SectionHeading eyebrow="Все коллекции" title="Полный ассортимент" />
        </div>
        <CatalogView collections={collections} facets={facets} />
      </div>
    </PageShell>
  );
}
