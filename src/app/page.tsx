import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/home/Hero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { EditorialSplit } from '@/components/home/EditorialSplit';
import { CollectionSpotlight } from '@/components/home/CollectionSpotlight';
import { Advantages } from '@/components/home/Advantages';
import { InteriorTeaser } from '@/components/home/InteriorTeaser';
import { PortfolioTeaser } from '@/components/home/PortfolioTeaser';
import { CtaSection } from '@/components/home/CtaSection';
import { getCollections, getFeaturedCollections, getLook } from '@/lib/catalog';

/**
 * Home page. Spotlight blocks pick their collection from the current stock
 * list, so nothing here points at a model that is no longer available.
 * @author Erbol king
 */
export default function HomePage() {
  const featured = getFeaturedCollections(8);
  const withPhoto = getCollections().filter((c) => c.hero);
  const bigFormat = withPhoto.find((c) => c.sizes.some((s) => s.startsWith('1200'))) ?? withPhoto[0];
  const spotlight = withPhoto.find((c) => c.look === 'marble') ?? featured[0];
  const outdoor = withPhoto.find((c) => c.applications.includes('Террасы') && c.slug !== bigFormat?.slug) ?? withPhoto[1];

  return (
    <PageShell overlay>
      <Hero />
      <CategoryShowcase />
      {bigFormat && (
        <EditorialSplit
          title="Плиты 1200×600 мм — меньше швов"
          text="Чем крупнее плита, тем меньше стыков: комната кажется просторнее, а пол и стены выглядят цельными. Подходит для пола, стен и столешниц."
          src={bigFormat.hero}
          href={`/collection/${bigFormat.slug}`}
          linkLabel={`Коллекция «${bigFormat.nameRu}»`}
        />
      )}
      <FeaturedProducts collections={featured} />
      {spotlight && (
        <CollectionSpotlight
          image={spotlight.hero}
          name={spotlight.nameRu}
          text={spotlight.description || getLook(spotlight.look)?.description || ''}
          href={`/collection/${spotlight.slug}`}
        />
      )}
      {outdoor && (
        <EditorialSplit
          title="Одна плитка для гостиной и террасы"
          text="У этих коллекций есть морозостойкие плиты со структурной поверхностью. Их можно положить и в доме, и на открытой террасе — пол будет одинаковым внутри и снаружи."
          src={outdoor.hero}
          href="/catalog/dlya-terras"
          linkLabel="Керамогранит для террас"
          reverse
        />
      )}
      <Advantages />
      <InteriorTeaser />
      <PortfolioTeaser />
      <CtaSection />
    </PageShell>
  );
}