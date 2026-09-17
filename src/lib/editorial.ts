export interface NewsPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageSeed: string;
}

export const news: NewsPost[] = [
  {
    slug: 'kollekciya-villa-alba-2025',
    title: 'Новинка 2025: коллекция Villa Alba от IDALGO',
    excerpt:
      'Травертин в поперечном и продольном распиле — Villa Alba Cross и Villa Alba River. Форматы 1200×600 и 600×600, матовая и лаппатированная поверхность. Уже на складе в Бишкеке.',
    date: '2025-08-20',
    category: 'Коллекции',
    imageSeed: 'news-villa-alba',
  },
  {
    slug: 'granitea-kapsulnaya-sistema-2026',
    title: 'GRANITEA 2026: капсульная система коллекций',
    excerpt:
      'Обновлённые серии Нейва, Исеть, Юрма, Шихан и новая коллекция «Алатау». Теперь коллекции сочетаются между собой по фактуре, формату и цвету.',
    date: '2026-01-15',
    category: 'Коллекции',
    imageSeed: 'news-granitea-2026',
  },
  {
    slug: 'keramogranit-dlya-terras-gid',
    title: 'Керамогранит на террасе: гид по укладке',
    excerpt:
      'Структурные поверхности R10–R11, морозостойкость F100 и три способа монтажа — на опоры, на гравий и на клей. Разбираем на примере коллекции Dolomiti.',
    date: '2025-06-30',
    category: 'Технологии',
    imageSeed: 'news-terrace',
  },
  {
    slug: 'trend-tyoplyj-minimalizm',
    title: 'Тренд сезона: тёплый минимализм',
    excerpt:
      'Песочные и глиняные оттенки, матовые поверхности и крупный формат. Собрали палитру из коллекций Siena, Denia Marfil, Cement и Wood Classic.',
    date: '2025-05-22',
    category: 'Тренды',
    imageSeed: 'news-trend',
  },
  {
    slug: 'partnyoram-arhitektoram',
    title: 'Условия для архитекторов и дизайнеров',
    excerpt:
      'Персональные цены, образцы для проектов, спецификации, раскладка и техподдержка на объекте в Бишкеке и по Кыргызстану. Рассказываем, как присоединиться.',
    date: '2025-04-18',
    category: 'Партнёрам',
    imageSeed: 'news-partners',
  },
  {
    slug: 'uhod-za-keramogranitom-pod-mramor',
    title: 'Как ухаживать за керамогранитом под мрамор',
    excerpt:
      'Полированные и лаппатированные поверхности требуют минимума усилий. Короткая памятка по средствам и частоте уборки.',
    date: '2025-03-12',
    category: 'Уход',
    imageSeed: 'news-care',
  },
];

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
    slug: 'komplekt-vannaya',
    title: 'Комплект для ванной комнаты',
    offer: '−15%',
    description:
      'При заказе керамогранита для стен и пола одной коллекции — скидка на раковину и смеситель из раздела «Интерьер и мебель».',
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
