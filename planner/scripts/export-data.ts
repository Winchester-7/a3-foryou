/**
 * Pulls the catalog from the main site (../src/lib) into a compact JSON the planner can load,
 * and copies the flat tile swatches + product thumbnails into planner/public.
 * Run: npm run data   (re-run whenever the main catalog changes)
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collections } from '../../src/lib/collections';
import { looks } from '../../src/lib/catalog';
import { doorModels } from '../../src/lib/doors';
import { sofaModels } from '../../src/lib/sofas';

const here = dirname(fileURLToPath(import.meta.url));
const SITE_PUBLIC = resolve(here, '../../public');
const OUT_PUBLIC = resolve(here, '../public');

function copy(src: string): string {
  const from = join(SITE_PUBLIC, src);
  const to = join(OUT_PUBLIC, src);
  if (!existsSync(from)) throw new Error(`missing asset ${src}`);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  return src;
}

const BRAND: Record<string, string> = { idalgo: 'IDALGO', granitea: 'GRANITEA', uralgranit: 'Уральский Гранит' };

const parseSize = (s: string) => {
  const [w, h] = s.split('×').map((n) => parseInt(n, 10));
  return { label: s, w: w / 1000, h: h / 1000 }; // metres
};

// Wood-look collections ship only room photos, so their flat plank textures were generated
// separately (planner/public/textures/wood) and are matched to real decors by name.
const WOOD: Record<string, [string, string][]> = {
  natura: [['Натура Цедро', 'natura-cedro'], ['Натура Мадейра', 'natura-madeira']],
  avellano: [['Авеллано Бежевый', 'avellano-beige'], ['Авеллано Серый', 'avellano-grey']],
  'ethno-wood': [['Этно Вуд Лайт', 'ethno-light'], ['Этно Вуд Браун', 'ethno-brown']],
  'wood-classic': [['Вуд Классик Бьянко', 'wood-classic-bianco'], ['Вуд Классик Натуральный', 'wood-classic-natural']],
};

const tiles = collections
  .filter((c) => c.swatches.length > 0 || WOOD[c.slug])
  .map((c) => ({
    slug: c.slug,
    name: c.nameRu,
    brand: BRAND[c.brand] ?? c.brand,
    look: c.look,
    surfaces: c.surfaces,
    sizes: c.sizes.map(parseSize),
    decors: WOOD[c.slug]
      ? WOOD[c.slug].map(([nameRu, file], i) => {
          const product = c.products.find((p) => p.nameRu === nameRu);
          return {
            id: `${c.slug}-${i + 1}`,
            name: nameRu,
            article: product?.article ?? null,
            texture: `/textures/wood/${file}.jpg`,
            image: product?.image ?? c.hero,
            href: product ? `/product/${product.slug}` : `/collection/${c.slug}`,
          };
        })
      : c.swatches.map((sw, i) => {
      const product = c.products.find((p) => p.image === sw);
      return {
        id: `${c.slug}-${i + 1}`,
        name: product ? product.nameRu : `${c.nameRu} · декор ${i + 1}`,
        article: product?.article ?? null,
        texture: copy(sw),
        image: product?.image ?? sw,
        href: product ? `/product/${product.slug}` : `/collection/${c.slug}`,
      };
    }),
  }));

const lookLabels = Object.fromEntries(looks.map((l) => [l.slug, l.short]));

const doors = doorModels.map((d) => ({
  slug: d.slug,
  name: d.name,
  style: d.style,
  glass: d.types.includes('ДО') && !d.types.includes('ДГ'),
  colors: d.colors.map((c) => ({ name: c.name, hex: c.hex })),
  image: copy(d.image),
  href: `/doors/${d.slug}`,
}));

const sofas = sofaModels.map((s) => ({
  slug: s.slug,
  name: s.name,
  kind: s.kind,
  sizes: s.sizes,
  fabrics: s.fabrics,
  image: copy(s.image),
  href: `/sofas/${s.slug}`,
}));

mkdirSync(resolve(here, '../src/data'), { recursive: true });
writeFileSync(
  resolve(here, '../src/data/catalog.json'),
  JSON.stringify({ tiles, lookLabels, doors, sofas }, null, 0),
);
console.log(`tiles: ${tiles.length} collections, ${tiles.reduce((n, t) => n + t.decors.length, 0)} decors; doors: ${doors.length}; sofas: ${sofas.length}`);
