import type { Category, Collection, Facets, Look, LookSlug, Product } from './types';
import { collections } from './collections';

export { collections };

/* ------------------------------------------------------------------ */
/*  Looks (тип поверхности)                                           */
/* ------------------------------------------------------------------ */

export const looks: Look[] = [
  {
    slug: 'marble',
    title: 'Керамогранит под мрамор',
    short: 'Под мрамор',
    tagline: 'Мрамор Calacatta, Statuario и оникс в керамограните',
    description:
      'Благородные текстуры мрамора с узнаваемыми прожилками, глубокой цифровой печатью и поверхностями от матовой до полированной. Роскошь и лоск для гостиных, ванных комнат и ресепшн-зон.',
  },
  {
    slug: 'stone',
    title: 'Керамогранит под камень',
    short: 'Под камень',
    tagline: 'Травертин, известняк, сланец и кварцит',
    description:
      'Изысканность природного камня в спокойной палитре: травертин, известняк, доломит, терраццо. Структурные поверхности и крупные форматы для минималистичных пространств.',
  },
  {
    slug: 'wood',
    title: 'Керамогранит под дерево',
    short: 'Под дерево',
    tagline: 'Тепло древесины без ухода и ограничений',
    description:
      'Достоверный рисунок древесины с сучками и трещинками, структурная поверхность SR, формат доски 1200×195 мм. Подходит для тёплого пола, влажных зон, террас и фасадов.',
  },
  {
    slug: 'loft',
    title: 'Керамогранит в стиле лофт',
    short: 'Лофт',
    tagline: 'Бетон, цемент и окисленный металл',
    description:
      'Индустриальная эстетика: сложные фактуры бетона, цемента и патинированного металла. Брутальный характер и нейтральный фон для городских интерьеров и общественных пространств.',
  },
  {
    slug: 'concrete',
    title: 'Керамогранит под бетон',
    short: 'Под бетон',
    tagline: 'Ровный матовый бетон для архитектурного минимализма',
    description:
      'Однородная микрозернистая поверхность, нейтральные оттенки и большие форматы с минимальным швом. База для спокойных, светлых интерьеров и вентилируемых фасадов.',
  },
  {
    slug: 'facade',
    title: 'Керамогранит для фасадов',
    short: 'Для фасадов',
    tagline: 'Вентилируемые фасады с гарантией цвета',
    description:
      'Технический керамогранит для навесных фасадных систем: морозостойкость F100, устойчивость к ультрафиолету и городской среде, богатая цветовая палитра, ступени и доборные элементы.',
  },
  {
    slug: 'technical',
    title: 'Технический керамогранит',
    short: 'Технический',
    tagline: 'Износостойкие поверхности R9–R12',
    description:
      'Технический и усиленный керамогранит толщиной до 12 мм для помещений с высокой проходимостью: противоскользящие поверхности, ступени, промышленные зоны, входные группы.',
  },
];

export function getLook(slug: string): Look | undefined {
  return looks.find((l) => l.slug === slug);
}

/* ------------------------------------------------------------------ */
/*  Categories (главное меню)                                         */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    slug: 'pod-derevo',
    title: 'Керамогранит под дерево',
    menuTitle: 'Под дерево',
    tagline: 'Дуб, орех, кедр и состаренная доска',
    description: getLook('wood')!.description,
    match: (c) => c.look === 'wood',
    heroCollection: 'natura',
  },
  {
    slug: 'pod-kamen',
    title: 'Керамогранит под камень',
    menuTitle: 'Под камень',
    tagline: 'Травертин, известняк, терраццо, сланец',
    description: getLook('stone')!.description,
    match: (c) => c.look === 'stone',
    heroCollection: 'villa-alba-cross',
  },
  {
    slug: 'pod-mramor',
    title: 'Керамогранит под мрамор',
    menuTitle: 'Под мрамор',
    tagline: 'Calacatta, Statuario, оникс и чёрный мрамор',
    description: getLook('marble')!.description,
    match: (c) => c.look === 'marble',
    heroCollection: 'lusso',
  },
  {
    slug: 'loft',
    title: 'Керамогранит в стиле лофт',
    menuTitle: 'Лофт',
    tagline: 'Металл, оксид, потёртый бетон',
    description: getLook('loft')!.description,
    match: (c) => c.look === 'loft',
    heroCollection: 'armor',
  },
  {
    slug: 'pod-beton',
    title: 'Керамогранит под бетон',
    menuTitle: 'Под бетон',
    tagline: 'Микроцемент и архитектурный бетон',
    description: getLook('concrete')!.description,
    match: (c) => Boolean(c.concrete),
    heroCollection: 'concepta',
  },
  {
    slug: 'dlya-fasadov',
    title: 'Керамогранит для фасадов',
    menuTitle: 'Для фасадов',
    tagline: 'Вентфасады, ступени, морозостойкость F100',
    description: getLook('facade')!.description,
    match: (c) => c.look === 'facade' || c.applications.some((a) => a.includes('фасад') || a.includes('Фасад')),
    heroCollection: 'uralfacades',
  },
  {
    slug: 'dlya-terras',
    title: 'Керамогранит для террас',
    menuTitle: 'Для террас',
    tagline: 'Противоскользящие поверхности для улицы',
    description:
      'Структурные и противоскользящие поверхности, устойчивость к морозу и нагрузкам. Единый дизайн для интерьера и открытой террасы, зоны барбекю, входной группы.',
    match: (c) => c.applications.includes('Террасы'),
    heroCollection: 'dolomiti',
  },
  {
    slug: 'dlya-vannoy',
    title: 'Керамогранит для ванной',
    menuTitle: 'Для ванной',
    tagline: 'Влагостойкие поверхности «пол-в-стену»',
    description:
      'Ректифицированные форматы для бесшовной раскладки стен и пола, гигиеничная поверхность, простая в уходе. Коллекции под мрамор, камень и бетон для спа-атмосферы.',
    match: (c) => c.applications.includes('Ванные комнаты'),
    heroCollection: 'sofia',
  },
  {
    slug: 'dlya-kuhni',
    title: 'Керамогранит для кухни',
    menuTitle: 'Для кухни',
    tagline: 'Фартук, столешница и пол в одном материале',
    description:
      'Устойчивость к пятнам, кислотам и высоким температурам. Крупноформатные плиты для стеновых панелей и износостойкие поверхности для пола.',
    match: (c) => c.applications.includes('Кухни'),
    heroCollection: 'calacatta',
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryCollections(slug: string): Collection[] {
  const cat = getCategory(slug);
  if (!cat) return [];
  return collections.filter(cat.match);
}

/* ------------------------------------------------------------------ */
/*  Accessors                                                         */
/* ------------------------------------------------------------------ */

export const allProducts: Product[] = collections.flatMap((c) => c.products);

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function getCollectionByProduct(productSlug: string): Collection | undefined {
  return collections.find((c) => c.products.some((p) => p.slug === productSlug));
}

export function getProduct(slug: string): { product: Product; collection: Collection } | undefined {
  for (const c of collections) {
    const product = c.products.find((p) => p.slug === slug);
    if (product) return { product, collection: c };
  }
  return undefined;
}

export function getRelatedProducts(collection: Collection, exceptSlug: string, limit = 4): Product[] {
  const same = collection.products.filter((p) => p.slug !== exceptSlug);
  if (same.length >= limit) return same.slice(0, limit);
  const others = collections
    .filter((c) => c.look === collection.look && c.slug !== collection.slug)
    .flatMap((c) => c.products);
  return [...same, ...others].slice(0, limit);
}

export function getFeaturedCollections(limit = 8): Collection[] {
  const picks = [
    'lusso', 'natura', 'armor', 'neiva', 'villa-alba-cross', 'concepta', 'dolomiti', 'karatash',
  ];
  return picks
    .map((s) => getCollection(s))
    .filter((c): c is Collection => Boolean(c))
    .slice(0, limit);
}

export function buildFacets(list: Collection[]): Facets {
  const uniq = (arr: string[]) => Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, 'ru'));
  return {
    sizes: uniq(list.flatMap((c) => c.sizes)),
    surfaces: uniq(list.flatMap((c) => c.surfaces)),
    brands: uniq(list.map((c) => brandName(c.brand))),
    looks: uniq(list.map((c) => getLook(c.look)?.short ?? c.look)),
    applications: uniq(list.flatMap((c) => c.applications)),
  };
}

export function brandName(b: string): string {
  return b === 'idalgo' ? 'IDALGO' : b === 'granitea' ? 'GRANITEA' : 'Уральский Гранит';
}

/** Prices are quoted on request — the source catalogs contain no retail pricing. */
export const PRICE_LABEL = 'Цена по запросу';
