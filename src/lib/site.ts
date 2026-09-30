export const site = {
  name: 'A3 FOR YOU',
  legalName: 'A3 FOR YOU — керамогранит и материалы для интерьера',
  shortDescription:
    'Керамогранит IDALGO, GRANITEA и «Уральский Гранит» в Бишкеке — от доступных решений до дизайнерских коллекций под мрамор, камень, дерево и бетон.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://a3foryou.kg',
  locale: 'ru_KG',
  city: 'Бишкек',
  country: 'Кыргызская Республика',
  phone: '+996 706 010 321',
  phoneHref: '+996706010321',
  whatsapp: 'https://wa.me/996706010321',
  whatsappNumber: '+996 706 010 321',
  email: 'hello@a3foryou.kg',
  street: 'ул. Анкара, 1А',
  address: 'г. Бишкек, ул. Анкара, 1А',
  hours: 'Ежедневно 09:00 – 19:00',
  instagram: 'https://instagram.com/a3foryou.kg',
  socials: [
    { label: 'WhatsApp', href: 'https://wa.me/996706010321' },
    { label: 'Instagram', href: 'https://instagram.com/a3foryou.kg' },
    { label: 'Pinterest', href: 'https://pinterest.com' },
  ],
} as const;

export type NavChild = { label: string; href: string; hint?: string };
export type NavItem = {
  label: string;
  href: string;
  mega?: 'catalog' | 'interior';
};

export const mainNav: NavItem[] = [
  { label: 'Каталог', href: '/catalog', mega: 'catalog' },
  { label: 'Двери', href: '/doors' },
  { label: 'Диваны', href: '/sofas' },
  { label: 'Где купить', href: '/where-to-buy' },
  { label: 'О продукции', href: '/about' },
  { label: 'Новости', href: '/news' },
  { label: 'Акции', href: '/promotions' },
  { label: 'Интерьер и мебель', href: '/interior', mega: 'interior' },
];
