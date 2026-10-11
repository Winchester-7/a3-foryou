/** @author Erbol king */
export interface Promotion {
  slug: string;
  title: string;
  offer: string;
  description: string;
  until: string;
  imageSeed: string;
  accent?: boolean;
}

export const promotions: Promotion[] = [
  {
    slug: 'sklad-2024',
    title: 'Складская коллекция 2024',
    offer: '−25%',
    description:
      'Скидка на остатки коллекций прошлых лет. Более 30 артикулов под дерево, бетон и камень в наличии на складе в Бишкеке.',
    until: '2026-03-31',
    imageSeed: 'promo-warehouse',
    accent: true,
  },
  {
    slug: 'plitka-i-dver',
    title: 'Плитка и дверь одним заказом',
    offer: '−15%',
    description:
      'При заказе керамогранита для стен и пола одной коллекции — скидка на межкомнатную дверь из каталога.',
    until: '2026-04-15',
    imageSeed: 'promo-bathset',
  },
  {
    slug: 'dostavka-po-bishkeku',
    title: 'Бесплатная доставка по Бишкеку',
    offer: '0 сом',
    description:
      'Доставка в пределах города без ограничения по объёму при заказе от установленной суммы. Подъём и занос — по запросу.',
    until: '2026-12-31',
    imageSeed: 'promo-delivery',
  },
  {
    slug: 'raskladka-v-podarok',
    title: 'Раскладка плитки в подарок',
    offer: 'Бонус',
    description:
      'Бесплатная профессиональная раскладка и расчёт материала при заказе от 40 м². Визуализация в 3D в течение 3 дней.',
    until: '2026-11-30',
    imageSeed: 'promo-layout',
  },
];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
