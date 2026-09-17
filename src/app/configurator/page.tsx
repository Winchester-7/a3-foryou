import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { InteriorConfigurator, type ConfRoom, type ConfTile } from '@/components/configurator/InteriorConfigurator';
import { collections, getLook } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Создать свой интерьер — конфигуратор керамогранита',
  description:
    'Онлайн-конфигуратор A3 FOR YOU: выберите помещение — ванную, кухню, гостиную или спальню — и посмотрите, как в нём смотрится керамогранит из каталога.',
  alternates: { canonical: '/configurator' },
};

const rooms: ConfRoom[] = [
  { id: 'bath', title: 'Ванная', image: '/catalog/natura/hero.jpg', hint: 'Для ванной подойдут влагостойкие ректифицированные коллекции под мрамор, камень и дерево.' },
  { id: 'kitchen', title: 'Кухня', image: '/catalog/armor/hero.jpg', hint: 'На кухне важна стойкость к пятнам и температуре — выбирайте матовые и лаппатированные поверхности.' },
  { id: 'living', title: 'Гостиная', image: '/catalog/lusso/hero.jpg', hint: 'В гостиной уместны крупный формат и выразительный рисунок мрамора или тёплого дерева.' },
  { id: 'bedroom', title: 'Спальня', image: '/catalog/neiva/hero.jpg', hint: 'Для спальни подойдут спокойные светлые коллекции — бетон, известняк, мягкий мрамор.' },
];

export default function ConfiguratorPage() {
  const picks = [
    'lusso', 'calacatta', 'neiva', 'karatash', 'villa-alba-cross', 'dolomiti',
    'natura', 'wood-classic', 'concepta', 'cement', 'armor', 'taganay', 'sofia', 'sinara', 'gerda',
  ];
  const tiles: ConfTile[] = picks
    .map((slug) => collections.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      slug: c.slug,
      name: c.nameRu,
      brand: c.brand === 'idalgo' ? 'IDALGO' : c.brand === 'granitea' ? 'GRANITEA' : 'Уральский Гранит',
      look: getLook(c.look)?.short ?? c.look,
      texture: c.swatches[0] ?? c.gallery[0] ?? c.hero,
      hint: c.tagline,
    }));

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Создать свой интерьер' }]} />
      <PageHeader
        title="Создать свой интерьер"
        text="Выберите помещение и подберите керамогранит из каталога — конфигуратор покажет, как поверхность будет смотреться в интерьере. Затем передайте подборку дизайнеру для точной раскладки и 3D-визуализации."
      />
      <InteriorConfigurator rooms={rooms} tiles={tiles} />
    </PageShell>
  );
}
