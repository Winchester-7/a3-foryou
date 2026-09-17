import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/home/Hero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { EditorialSplit } from '@/components/home/EditorialSplit';
import { VideoCollectionBanner } from '@/components/home/VideoCollectionBanner';
import { Advantages } from '@/components/home/Advantages';
import { InteriorTeaser } from '@/components/home/InteriorTeaser';
import { NewsTeaser } from '@/components/home/NewsTeaser';
import { CtaSection } from '@/components/home/CtaSection';
import { getFeaturedCollections } from '@/lib/catalog';

export default function HomePage() {
  const featured = getFeaturedCollections(8);

  return (
    <PageShell overlay>
      <Hero />
      <CategoryShowcase />
      <EditorialSplit
        eyebrow="Крупный формат"
        title="Плиты 1200×600 мм с минимальным швом"
        text="Большие форматы визуально расширяют пространство и сокращают количество стыков. Идеальны для полов, стеновых панелей и столешниц. Ректифицированный край — шов от 1,5 мм."
        src="/catalog/anna/hero.jpg"
        href="/about"
        linkLabel="О технологии"
      />
      <FeaturedProducts collections={featured} />
      <VideoCollectionBanner
        src="/hero/calacatta-banner.mp4"
        eyebrow="Коллекция месяца"
        title="Калакатта — мрамор, который не выходит из моды"
        text="Белый фон с драматичными серо-золотыми прожилками и глубокой цифровой печатью. Десять вариантов рисунка для бесшовной книжной раскладки."
        href="/collection/calacatta"
      />
      <EditorialSplit
        eyebrow="Улица и интерьер"
        title="Один дизайн для гостиной и террасы"
        text="Структурные поверхности R10–R11 и морозостойкость F100 позволяют использовать одну коллекцию в интерьере и на открытой террасе. Граница между домом и садом исчезает."
        src="/catalog/dolomiti/hero.jpg"
        href="/catalog/dlya-terras"
        linkLabel="Керамогранит для террас"
        reverse
      />
      <Advantages />
      <InteriorTeaser />
      <NewsTeaser />
      <CtaSection />
    </PageShell>
  );
}
