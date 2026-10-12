/**
 * A3 FOR YOU — site-wide constants and navigation (client-safe).
 * Contact details and the short description are editable in the admin panel;
 * the values below are defaults. Use getSite() (server) or useSite() (client)
 * to get the current ones.
 * @author Erbol king
 */
export interface SiteInfo {
  name: string;
  legalName: string;
  shortDescription: string;
  url: string;
  /** 3D room planner — a separate app on its own domain so the heavy 3D engine never slows the shop */
  plannerUrl: string;
  locale: string;
  city: string;
  country: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  whatsappNumber: string;
  email: string;
  street: string;
  address: string;
  hours: string;
  instagram: string;
  socials: { label: string; href: string }[];
}

/** Fields the admin panel may override. */
export type SiteSettings = Partial<
  Pick<
    SiteInfo,
    'shortDescription' | 'phone' | 'phoneHref' | 'whatsapp' | 'whatsappNumber' | 'email' | 'street' | 'address' | 'hours' | 'instagram'
  >
>;

export const site: SiteInfo = {
  name: 'A3 FOR YOU',
  legalName: 'A3 FOR YOU — керамогранит и материалы для интерьера',
  shortDescription:
    'Керамогранит IDALGO, GRANITEA, KERRANOVA, GRASARO и других заводов в Бишкеке — всё из наличия на складе: мрамор, камень, дерево и бетон.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://a3foryou.kg',
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
};

/** Applies edited settings on top of the defaults (keeps the social links in sync). */
export function mergeSite(settings: SiteSettings | null | undefined): SiteInfo {
  const s = { ...site, ...(settings ?? {}) };
  s.socials = site.socials.map((x) =>
    x.label === 'WhatsApp' ? { ...x, href: s.whatsapp } : x.label === 'Instagram' ? { ...x, href: s.instagram } : x,
  );
  return s;
}

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
