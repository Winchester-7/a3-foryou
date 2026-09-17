import sofasImages from './sofas-images.json';

const IMG = sofasImages as Record<string, string[]>;

export interface FabricColor {
  name: string;
  hex: string;
}

export interface SofaModel {
  slug: string;
  name: string;
  brand: string;
  kind: 'Диван' | 'Кресло';
  description: string;
  frame: string;
  legs: string;
  filler: string;
  sizes: string[];
  fabrics: FabricColor[];
  custom: boolean;
  specs: [string, string][];
  hero: string;
  image: string;
  gallery: string[];
}

const FABRICS: FabricColor[] = [
  { name: 'Латте', hex: '#cdbfa8' },
  { name: 'Тауп', hex: '#9a8f80' },
  { name: 'Графит', hex: '#4c4d4f' },
  { name: 'Олива', hex: '#6f6b49' },
  { name: 'Терракота', hex: '#a45c43' },
  { name: 'Индиго', hex: '#3f4a63' },
  { name: 'Крем', hex: '#e7ded0' },
];

const COMMON_SPECS = (frame: string, legs: string, filler: string): [string, string][] => [
  ['Каркас', frame],
  ['Крепление', 'Болтовое соединение несущих элементов'],
  ['Ножки', legs],
  ['Наполнитель', filler],
  ['Обивка', 'Обивочная ткань на выбор (износостойкость 100 000 циклов)'],
  ['Гарантия', '10 лет на каркас и наполнитель'],
];

type Row = {
  slug: string;
  name: string;
  kind: 'Диван' | 'Кресло';
  pages: [number, number];
  sizes: string[];
  legs?: string;
  podium?: boolean;
  description: string;
};

const FRAME = 'Массив дерева бук, берёзовая фанера';
const FILLER = 'Пенополиуретан, гипоаллергенный холлофайбер или пух-перо';
const LEGS_METAL = 'Металлические, цвет чёрный';
const LEGS_WOOD = 'Массив дерева, цвет венге';

const ROWS: Row[] = [
  {
    slug: 'a128', name: 'A128', kind: 'Диван', pages: [10, 13],
    sizes: ['200 × 95', '230 × 95', '270 × 95'],
    description: 'Прямой диван с округлым основанием и мягкими подлокотниками. Тонкие металлические ножки визуально облегчают силуэт. Каркас — массив бука.',
  },
  {
    slug: 'a129', name: 'A129', kind: 'Диван', pages: [14, 15],
    sizes: ['200 × 95', '230 × 95', '250 × 95'],
    description: 'Диван с вертикальной прострочкой по боковинам и спинке. Аккуратная геометрия и глубокая посадка — для гостиных в спокойной палитре.',
  },
  {
    slug: 'a134', name: 'A134', kind: 'Диван', pages: [16, 17],
    sizes: ['200 × 100', '230 × 100', '260 × 100'],
    description: 'Объёмный диван с широкими подлокотниками и мягкими подушками спинки. Комфортная посадка для всей семьи.',
  },
  {
    slug: 'a105', name: 'A105', kind: 'Диван', pages: [18, 19], legs: LEGS_WOOD,
    sizes: ['200 × 80'],
    description: 'Компактный диван на деревянных ножках цвета венге. Строгие линии в скандинавском духе — для кабинета, спальни или небольшой гостиной.',
  },
  {
    slug: 'a122', name: 'A122', kind: 'Диван', pages: [20, 23],
    sizes: ['200 × 90', '260 × 90'],
    description: 'Лаконичный диван с низким профилем и тонкими подлокотниками. Идеален для современных минималистичных интерьеров.',
  },
  {
    slug: 'a125', name: 'A125', kind: 'Диван', pages: [24, 27],
    sizes: ['230 × 107'],
    description: 'Диван увеличенной глубины с крупными подушками. Модель для тех, кто ценит расслабленную посадку «утонуть».',
  },
  {
    slug: 'a130', name: 'A130', kind: 'Диван', pages: [28, 29],
    sizes: ['200 × 95', '230 × 95', '250 × 95'],
    description: 'Диван с выразительной строчкой-каналами по спинке и сиденью. Тактильная фактура и чёткий рисунок.',
  },
  {
    slug: 'a136', name: 'A136', kind: 'Диван', pages: [30, 33],
    sizes: ['210 × 110', '240 × 110', '270 × 110'],
    description: 'Крупный диван с высокими подлокотниками-«валиками» и глубоким сиденьем. Центральный предмет большой гостиной.',
  },
  {
    slug: 'a132', name: 'A132', kind: 'Диван', pages: [34, 35], podium: true,
    sizes: ['220 × 100', '240 × 100', '260 × 100'],
    description: 'Диван на подиуме: корпус словно парит над полом. Архитектурная форма для дизайнерских проектов.',
  },
  {
    slug: 'a133', name: 'A133', kind: 'Диван', pages: [36, 37], podium: true,
    sizes: ['200 × 100', '230 × 100', '260 × 100'],
    description: 'Модель на подиуме с мягкими скруглениями корпуса. Округлые формы основания подчёркивают мягкость силуэта.',
  },
  {
    slug: 'c128', name: 'C128', kind: 'Кресло', pages: [39, 40],
    sizes: ['78 × 97 × 77'],
    description: 'Кресло-компаньон к дивану A128. Округлое основание, мягкие подлокотники, металлические ножки.',
  },
  {
    slug: 'c129', name: 'C129', kind: 'Кресло', pages: [41, 42],
    sizes: ['80 × 90 × 80'],
    description: 'Кресло с вертикальной прострочкой в едином стиле с диваном A129.',
  },
  {
    slug: 'c105', name: 'C105', kind: 'Кресло', pages: [43, 44], legs: LEGS_WOOD,
    sizes: ['81 × 80 × 69'],
    description: 'Компактное кресло на деревянных ножках венге. Пара к дивану A105.',
  },
  {
    slug: 'c122', name: 'C122', kind: 'Кресло', pages: [45, 46],
    sizes: ['80 × 88 × 74'],
    description: 'Минималистичное кресло с низким профилем. Дополняет диван A122.',
  },
  {
    slug: 'c114', name: 'C114', kind: 'Кресло', pages: [47, 48],
    sizes: ['76 × 87 × 90'],
    description: 'Кресло с высокой спинкой и выраженным «крылом». Уютное место для чтения.',
  },
  {
    slug: 'c127', name: 'C127', kind: 'Кресло', pages: [49, 50],
    sizes: ['76 × 87 × 93'],
    description: 'Кресло с высокой спинкой и мягким подголовником. Форма, обнимающая при посадке.',
  },
  {
    slug: 'c214', name: 'C214', kind: 'Кресло', pages: [51, 52],
    sizes: ['82 × 84 × 78'],
    description: 'Кресло с округлыми формами и глубоким сиденьем. Акцентный предмет в гостиной или спальне.',
  },
];

function imagesFor(a: number, b: number): string[] {
  const out: string[] = [];
  for (let p = a; p <= b; p++) out.push(...(IMG[String(p)] ?? []));
  return Array.from(new Set(out));
}

export const sofaModels: SofaModel[] = ROWS.map((r) => {
  const imgs = imagesFor(r.pages[0], r.pages[1]);
  const hero = imgs.find((s) => true) ?? '/sofas/placeholder.jpg';
  // prefer a wide lifestyle-ish first, else the spec-page product shot
  const image = imgs[0] ?? hero;
  const legs = r.legs ?? LEGS_METAL;
  const filler = FILLER;

  return {
    slug: r.slug,
    name: r.name,
    brand: 'Delavega',
    kind: r.kind,
    description: r.description,
    frame: FRAME,
    legs,
    filler,
    sizes: r.sizes,
    fabrics: FABRICS,
    custom: true,
    specs: [
      ...COMMON_SPECS(FRAME, legs, filler),
      ...(r.podium ? ([['Конструкция', 'Подиум — корпус приподнят над полом']] as [string, string][]) : []),
      ['Индивидуальный размер', 'Возможно изготовление по вашим габаритам'],
    ],
    hero,
    image,
    gallery: imgs.slice(0, 10),
  };
});

export function getSofa(slug: string): SofaModel | undefined {
  return sofaModels.find((s) => s.slug === slug);
}
