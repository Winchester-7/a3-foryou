/**
 * Pulls the catalog from the main site (../src/lib) into a compact JSON the planner can load,
 * and copies the flat tile swatches + product thumbnails into planner/public.
 * Run: npm run data   (re-run whenever the main catalog changes)
 * @author Erbol king
 */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCollections } from '../../src/lib/collections';
import { looks } from '../../src/lib/looks';
import { getDoors } from '../../src/lib/doors';
import { getSofas } from '../../src/lib/sofas';

const here = dirname(fileURLToPath(import.meta.url));
const SITE_PUBLIC = resolve(here, '../../public');
const OUT_PUBLIC = resolve(here, '../public');

// start from a clean slate so removed products do not linger in the bundle
for (const dir of ['catalog', 'doors', 'doors2', 'sofas', 'tiles']) {
  rmSync(join(OUT_PUBLIC, dir), { recursive: true, force: true });
}

function copy(src: string): string {
  const from = join(SITE_PUBLIC, src);
  const to = join(OUT_PUBLIC, src);
  if (!existsSync(from)) throw new Error(`missing asset ${src}`);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  return src;
}

const BRAND: Record<string, string> = {
  idalgo: 'IDALGO',
  granitea: 'GRANITEA',
  uralgranit: 'Уральский Гранит',
  grasaro: 'GRASARO',
  kerranova: 'KERRANOVA',
  china: 'Китай',
  axima: 'Аксима',
  kazakhstan: 'Казахстан',
  uzbekistan: 'Узбекистан',
  tianshan: 'Тянь-Шань',
};

const parseSize = (s: string) => {
  const [w, h] = s.split('×').map((n) => parseInt(n, 10));
  return { label: s, w: w / 1000, h: h / 1000 }; // metres
};

const collections = getCollections();
const doorModels = getDoors();
const sofaModels = getSofas();

const tiles = collections
  .filter((c) => c.swatches.length > 0 && c.sizes.length > 0)
  .map((c) => {
    const withPhoto = c.products.filter((p) => p.image);
    return {
      slug: c.slug,
      name: c.nameRu,
      brand: BRAND[c.brand] ?? c.brand,
      look: c.look,
      surfaces: c.surfaces.length ? c.surfaces : ['Матовая'],
      sizes: c.sizes.map(parseSize),
      decors: withPhoto.map((p, i) => ({
        id: `${c.slug}-${i + 1}`,
        name: p.nameRu,
        article: p.article ?? null,
        // the manufacturer photo of the tile face is a flat swatch — exactly what the planner needs
        texture: copy(p.image),
        image: p.image,
        href: `/product/${p.slug}`,
      })),
    };
  })
  .filter((c) => c.decors.length > 0);

const lookLabels = Object.fromEntries(looks.map((l) => [l.slug, l.short]));

const doors = doorModels
  .filter((d) => d.image)
  .map((d) => ({
    slug: d.slug,
    name: d.name,
    style: d.style,
    brand: d.brand,
    kind: d.kind ?? 'interior',
    glass: d.types.includes('ДО') && !d.types.includes('ДГ'),
    colors: d.colors.map((c) => ({ name: c.name, hex: c.hex })),
    sizes: d.sizes,
    image: copy(d.image),
    href: `/doors/${d.slug}`,
  }));

const sofas = sofaModels
  .filter((s) => s.image)
  .map((s) => ({
    slug: s.slug,
    name: s.name,
    kind: s.kind,
    sizes: s.sizes,
    fabrics: s.fabrics,
    image: copy(s.image),
    href: `/sofas/${s.slug}`,
  }));

mkdirSync(resolve(here, '../src/data'), { recursive: true });
writeFileSync(resolve(here, '../src/data/catalog.json'), JSON.stringify({ tiles, lookLabels, doors, sofas }, null, 0));
console.log(
  `tiles: ${tiles.length} collections, ${tiles.reduce((n, t) => n + t.decors.length, 0)} decors; doors: ${doors.length}; sofas: ${sofas.length}`,
);
