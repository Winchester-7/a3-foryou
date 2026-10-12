/** @author Erbol king */
export type Brand =
  | 'idalgo'
  | 'granitea'
  | 'uralgranit'
  | 'grasaro'
  | 'kerranova'
  | 'china'
  | 'axima'
  | 'kazakhstan'
  | 'uzbekistan'
  | 'tianshan';

export type LookSlug =
  | 'marble'
  | 'stone'
  | 'wood'
  | 'loft'
  | 'concrete'
  | 'facade'
  | 'technical';

export interface Look {
  slug: LookSlug;
  title: string;        // «Керамогранит под мрамор»
  short: string;        // «Под мрамор»
  tagline: string;
  description: string;
}

/** One line of the warehouse list: a format + surface with the quantity in stock. */
export interface StockLine {
  size: string;
  surface: string;
  pcs: number;
  m2: number;
  /** name of the line in the warehouse list — the key for the Excel import */
  label?: string;
}

export interface Product {
  slug: string;
  name: string;         // 'Lusso Santo'
  nameRu: string;       // 'Люссо Санто'
  color: string;        // 'Santo' / 'Белый'
  article?: string;     // 'G390'
  sizes: string[];
  surfaces: string[];
  image: string;        // card image (real photo), '' when there is none yet
  images: string[];     // gallery
  /** quantities from the warehouse list */
  stock?: StockLine[];
  /** no manufacturer photo found for this model yet */
  noPhoto?: boolean;
  /** manufacturer page the data came from */
  source?: string;
}

export interface Collection {
  slug: string;         // 'lusso'
  name: string;         // 'Lusso'
  nameRu: string;       // 'Люссо'
  brand: Brand;
  look: LookSlug;
  concrete?: boolean;   // loft collection with a concrete/cement character
  sizes: string[];
  surfaces: string[];
  thickness: string;
  formatNote?: string;
  applications: string[];
  tagline: string;
  description: string;
  hero: string;
  gallery: string[];
  swatches: string[];
  products: Product[];
  /** total m² in stock across the collection */
  stockM2?: number;
}

export interface Category {
  slug: string;         // 'pod-mramor'
  title: string;
  menuTitle: string;
  tagline: string;
  description: string;
  match: (c: Collection) => boolean;
  heroCollection: string; // slug used for the banner image
}

export interface Facets {
  sizes: string[];
  surfaces: string[];
  brands: string[];
  looks: string[];
  applications: string[];
}

export interface InteriorCategory {
  slug: string;
  title: string;
  menuTitle: string;
  tagline: string;
  description: string;
  bannerSeed: string;
  items: InteriorItem[];
}

export interface InteriorItem {
  slug: string;
  name: string;
  brand: string;
  material: string;
  imageSeed: string;
  note: string;
}
