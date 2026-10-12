/**
 * Catalogue queries (server side). Everything is a function so that data edited
 * in the admin panel shows up immediately.
 * @author Erbol king
 */
import type { Category, Collection, Facets, Product } from './types';
import { getCollections } from './collections';
import { getLook, looks } from './looks';
import { brandName } from './brands';

export { getCollections, getLook, looks };
export { brandName, brandKeyFromName } from './brands';
export { formatM2, productStockM2, PRICE_LABEL } from './format';

/* ------------------------------------------------------------------ */
/*  Categories (главное меню)                                         */
/* ------------------------------------------------------------------ */

const ALL_CATEGORIES: Category[] = [
  {
    slug: 'pod-derevo',
    title: 'Керамогранит под дерево',
    menuTitle: 'Под дерево',
    tagline: 'Дуб, орех, кедр и состаренная доска',
    description: getLook('wood')!.description,
    match: (c) => c.look === 'wood',
    heroCollection: '',
  },
  {
    slug: 'pod-kamen',
    title: 'Керамогранит под камень',
    menuTitle: 'Под камень',
    tagline: 'Травертин, известняк, терраццо, сланец',
    description: getLook('stone')!.description,
    match: (c) => c.look === 'stone',
    heroCollection: '',
  },
  {
    slug: 'pod-mramor',
    title: 'Керамогранит под мрамор',
    menuTitle: 'Под мрамор',
    tagline: 'Calacatta, Statuario, оникс и чёрный мрамор',
    description: getLook('marble')!.description,
    match: (c) => c.look === 'marble',
    heroCollection: '',
  },
  {
    slug: 'loft',
    title: 'Керамогранит в стиле лофт',
    menuTitle: 'Лофт',
    tagline: 'Металл, оксид, потёртый бетон',
    description: getLook('loft')!.description,
    match: (c) => c.look === 'loft',
    heroCollection: '',
  },
  {
    slug: 'pod-beton',
    title: 'Керамогранит под бетон',
    menuTitle: 'Под бетон',
    tagline: 'Микроцемент и архитектурный бетон',
    description: getLook('concrete')!.description,
    match: (c) => c.look === 'concrete' || Boolean(c.concrete),
    heroCollection: '',
  },
  {
    slug: 'dlya-fasadov',
    title: 'Керамогранит для фасадов',
    menuTitle: 'Для фасадов',
    tagline: 'Вентфасады, ступени, морозостойкость F100',
    description: getLook('facade')!.description,
    match: (c) => c.look === 'facade' || c.applications.some((a) => a.includes('фасад') || a.includes('Фасад')),
    heroCollection: '',
  },
  {
    slug: 'dlya-terras',
    title: 'Керамогранит для террас',
    menuTitle: 'Для террас',
    tagline: 'Противоскользящие поверхности для улицы',
    description:
      'Структурные и противоскользящие поверхности, устойчивость к морозу и нагрузкам. Единый дизайн для интерьера и открытой террасы, зоны барбекю, входной группы.',
    match: (c) => c.applications.includes('Террасы'),
    heroCollection: '',
  },
  {
    slug: 'dlya-vannoy',
    title: 'Керамогранит для ванной',
    menuTitle: 'Для ванной',
    tagline: 'Влагостойкие поверхности «пол-в-стену»',
    description:
      'Ректифицированные форматы для бесшовной раскладки стен и пола, гигиеничная поверхность, простая в уходе. Коллекции под мрамор, камень и бетон для спа-атмосферы.',
    match: (c) => c.applications.includes('Ванные комнаты'),
    heroCollection: '',
  },
  {
    slug: 'dlya-kuhni',
    title: 'Керамогранит для кухни',
    menuTitle: 'Для кухни',
    tagline: 'Фартук, столешница и пол в одном материале',
    description:
      'Устойчивость к пятнам, кислотам и высоким температурам. Крупноформатные плиты для стеновых панелей и износостойкие поверхности для пола.',
    match: (c) => c.applications.includes('Кухни'),
    heroCollection: '',
  },
];

const categoriesMemo = new WeakMap<object, Category[]>();

/** Only directions that have something in stock; the banner photo comes from the biggest collection with a photo. */
export function getCategories(): Category[] {
  const collections = getCollections();
  let list = categoriesMemo.get(collections);
  if (!list) {
    list = ALL_CATEGORIES.map((c) => {
      const pool = collections.filter(c.match).filter((x) => x.hero);
      const best = [...pool].sort((p, q) => (q.stockM2 ?? 0) - (p.stockM2 ?? 0))[0];
      return { ...c, heroCollection: best?.slug ?? '' };
    }).filter((c) => collections.some(c.match));
    categoriesMemo.set(collections, list);
  }
  return list;
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getCategoryCollections(slug: string): Collection[] {
  const cat = getCategory(slug);
  if (!cat) return [];
  return getCollections().filter(cat.match);
}

/* ------------------------------------------------------------------ */
/*  Accessors                                                         */
/* ------------------------------------------------------------------ */

const productsMemo = new WeakMap<object, Product[]>();

export function getAllProducts(): Product[] {
  const collections = getCollections();
  let list = productsMemo.get(collections);
  if (!list) {
    list = collections.flatMap((c) => c.products);
    productsMemo.set(collections, list);
  }
  return list;
}

export function getCollection(slug: string): Collection | undefined {
  return getCollections().find((c) => c.slug === slug);
}

export function getCollectionByProduct(productSlug: string): Collection | undefined {
  return getCollections().find((c) => c.products.some((p) => p.slug === productSlug));
}

export function getProduct(slug: string): { product: Product; collection: Collection } | undefined {
  for (const c of getCollections()) {
    const product = c.products.find((p) => p.slug === slug);
    if (product) return { product, collection: c };
  }
  return undefined;
}

export function getRelatedProducts(collection: Collection, exceptSlug: string, limit = 4): Product[] {
  const same = collection.products.filter((p) => p.slug !== exceptSlug);
  if (same.length >= limit) return same.slice(0, limit);
  const others = getCollections()
    .filter((c) => c.look === collection.look && c.slug !== collection.slug)
    .flatMap((c) => c.products);
  return [...same, ...others].slice(0, limit);
}

/** Biggest collections that have real photography — shown on the home page. */
export function getFeaturedCollections(limit = 8): Collection[] {
  return getCollections()
    .filter((c) => c.hero && c.products.some((p) => p.image))
    .sort((a, b) => (b.stockM2 ?? 0) - (a.stockM2 ?? 0))
    .slice(0, limit);
}

/** A photo that is guaranteed to exist — used when a banner has no image of its own. */
export function getFallbackHero(): string {
  return getCollections().find((c) => c.hero)?.hero ?? '/hero/keramo-scene.jpg';
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
