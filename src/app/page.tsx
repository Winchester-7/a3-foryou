import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/home/Hero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { EditorialSplit } from '@/components/home/EditorialSplit';
import { VideoCollectionBanner } from '@/components/home/VideoCollectionBanner';
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
          eyebrow="Крупный формат"
          title="Плиты 1200×600 мм с минимальным швом"
          text="Большие форматы визуально расширяют пространство и сокращают количество стыков. Идеальны для полов, стеновых панелей и столешниц."
          src={bigFormat.hero}
          href={`/collection/${bigFormat.slug}`}
          linkLabel={`Коллекция «${bigFormat.nameRu}»`}
        />
      )}
      <FeaturedProducts collections={featured} />
      {spotlight && (
        <VideoCollectionBanner
          src="/hero/calacatta-banner.mp4"
          eyebrow="Коллекция месяца"
          title={`${spotlight.nameRu} — в наличии на складе в Бишкеке`}
          text={getLook(spotlight.look)?.description ?? spotlight.description}
          href={`/collection/${spotlight.slug}`}
        />
      )}
      {outdoor && (
        <EditorialSplit
          eyebrow="Улица и интерьер"
          title="Один дизайн для гостиной и террасы"
          text="Структурные поверхности и морозостойкость позволяют использовать одну коллекцию в интерьере и на открытой террасе. Граница между домом и садом исчезает."
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