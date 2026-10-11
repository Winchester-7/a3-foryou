/**
 * A3 FOR YOU — site-wide settings and navigation.
 * @author Erbol king
 */
export const site = {
  name: 'A3 FOR YOU',
  legalName: 'A3 FOR YOU — керамогранит и материалы для интерьера',
  shortDescription:
    'Керамогранит IDALGO, GRANITEA, KERRANOVA, GRASARO и других заводов в Бишкеке — всё из наличия на складе: мрамор, камень, дерево и бетон.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://a3foryou.kg',
  /** 3D room planner — a separate app on its own domain so the heavy 3D engine never slows the shop */
  plannerUrl: process.env.NEXT_PUBLIC_PLANNER_URL ?? 'https://a3-foryou-3d.netlify.app',
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

export type NavItem = {
  label: string;
  href: string;
  /** opens the catalog mega menu */
  mega?: 'catalog';
  /** leaves the shop (3D planner lives on its own domain) */
  external?: boolean;
  /** rendered as an accent call-to-action */
  highlight?: boolean;
};

/** Doors and sofas are part of the catalog now, not separate top-level entries. */
export const catalogExtras = [
  { href: '/doors', title: 'Двери', tagline: 'Межкомнатные и входные двери' },
  { href: '/sofas', title: 'Диваны', tagline: 'Диваны и кресла для интерьера' },
] as const;

export const mainNav: NavItem[] = [
  { label: 'Каталог', href: '/catalog', mega: 'catalog' },
  { label: 'Где купить', href: '/where-to-buy' },
  { label: 'О продукции', href: '/about' },
  { label: 'Портфолио', href: '/portfolio' },
  { label: 'Акции', href: '/promotions' },
  { label: 'Создать свой интерьер', href: site.plannerUrl, external: true, highlight: true },
];
