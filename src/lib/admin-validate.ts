/**
 * Validation + normalisation of everything the admin panel saves, so a typo in
 * the form can never take the public site down. Server-only.
 * @author Erbol king
 */
import type { Collection, Product, StockLine } from './types';
import type { DataName } from './store';
import { BRAND_NAMES } from './brands';
import { looks } from './looks';
import { slugify } from './slug';

type Result = { ok: true; data: unknown } | { ok: false; error: string };

const str = (v: unknown, max = 4000): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const strList = (v: unknown, max = 60): string[] =>
  Array.isArray(v) ? v.map((x) => str(x, 200)).filter(Boolean).slice(0, max) : [];
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const slugOk = (s: string) => /^[a-z0-9][a-z0-9-]{0,80}$/.test(s);
const urlOk = (s: string) => s === '' || /^(\/|https?:\/\/)/.test(s);

function uniqueSlugs<T extends { slug: string }>(items: T[], what: string): string | null {
  const seen = new Set<string>();
  for (const it of items) {
    if (!slugOk(it.slug)) return `${what}: некорректный адрес «${it.slug}» (латиница, цифры и дефис)`;
    if (seen.has(it.slug)) return `${what}: повторяется адрес «${it.slug}»`;
    seen.add(it.slug);
  }
  return null;
}

/* ------------------------------------------------------------------ tiles */

function normStock(v: unknown): StockLine[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isRecord)
    .map((s) => ({
      size: str(s.size, 40),
      surface: str(s.surface, 60),
      pcs: Math.max(0, Math.round(num(s.pcs))),
      m2: Math.max(0, Math.round(num(s.m2) * 100) / 100),
      ...(str(s.label, 200) ? { label: str(s.label, 200) } : {}),
    }))
    .filter((s) => s.size || s.surface || s.m2 || s.pcs);
}

function normTiles(input: unknown): Result {
  const raw = isRecord(input) && Array.isArray(input.collections) ? input.collections : null;
  if (!raw) return { ok: false, error: 'Нет списка коллекций' };

  const collections: Collection[] = [];
  const productSlugs = new Set<string>();

  for (const c of raw) {
    if (!isRecord(c)) continue;
    const slug = str(c.slug, 80) || slugify(str(c.nameRu) || str(c.name));
    const nameRu = str(c.nameRu, 120);
    if (!nameRu) return { ok: false, error: 'У коллекции нет названия' };
    const brand = str(c.brand, 40);
    const look = looks.some((l) => l.slug === c.look) ? (c.look as Collection['look']) : 'stone';

    const products: Product[] = [];
    for (const p of Array.isArray(c.products) ? c.products : []) {
      if (!isRecord(p)) continue;
      const pn = str(p.nameRu, 160);
      if (!pn) return { ok: false, error: `В коллекции «${nameRu}» есть позиция без названия` };
      const pslug = str(p.slug, 100) || slugify(`${slug}-${pn}`);
      if (productSlugs.has(pslug)) return { ok: false, error: `Повторяется адрес позиции «${pslug}»` };
      productSlugs.add(pslug);
      const stock = normStock(p.stock);
      const images = strList(p.images, 20).filter(urlOk);
      const image = str(p.image, 300) && urlOk(str(p.image, 300)) ? str(p.image, 300) : images[0] ?? '';
      const sizes = stock.length ? Array.from(new Set(stock.map((s) => s.size).filter(Boolean))) : strList(p.sizes, 20);
      const surfaces = stock.length ? Array.from(new Set(stock.map((s) => s.surface).filter(Boolean))) : strList(p.surfaces, 20);
      products.push({
        slug: pslug,
        name: str(p.name, 160) || pn,
        nameRu: pn,
        color: str(p.color, 80),
        article: str(p.article, 60) || undefined,
        sizes,
        surfaces,
        image,
        images: image && !images.includes(image) ? [image, ...images] : images,
        stock,
        noPhoto: !image,
        source: str(p.source, 300) || undefined,
      });
    }

    const photos = products.filter((p) => p.image);
    const sizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
    const surfaces = Array.from(new Set(products.flatMap((p) => p.surfaces)));
    const hero = str(c.hero, 300) && urlOk(str(c.hero, 300)) ? str(c.hero, 300) : photos[0]?.image ?? '';
    collections.push({
      slug,
      name: str(c.name, 120) || nameRu,
      nameRu,
      brand: (brand in BRAND_NAMES ? brand : brand || 'idalgo') as Collection['brand'],
      look,
      concrete: Boolean(c.concrete) || undefined,
      sizes,
      surfaces,
      thickness: str(c.thickness, 40),
      applications: strList(c.applications, 20),
      tagline: str(c.tagline, 200),
      description: str(c.description, 2000),
      hero,
      gallery: strList(c.gallery, 20).filter(urlOk),
      swatches: photos.map((p) => p.image).slice(0, 8),
      products,
      stockM2: Math.round(products.reduce((n, p) => n + (p.stock ?? []).reduce((k, s) => k + s.m2, 0), 0) * 10) / 10,
    });
  }

  const dup = uniqueSlugs(collections, 'Коллекции');
  if (dup) return { ok: false, error: dup };
  const keepGenerated = isRecord(input) && typeof input.generated === 'string' ? input.generated : undefined;
  return { ok: true, data: { generated: keepGenerated, collections } };
}

/* ------------------------------------------------------------------ doors */

function normColors(v: unknown): { name: string; hex: string; image?: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isRecord)
    .map((c) => ({
      name: str(c.name, 60),
      hex: /^#[0-9a-fA-F]{6}$/.test(str(c.hex)) ? str(c.hex) : '#b9a38a',
      ...(str(c.image, 300) && urlOk(str(c.image, 300)) ? { image: str(c.image, 300) } : {}),
    }))
    .filter((c) => c.name);
}

function normSpecs(v: unknown): [string, string][] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is unknown[] => Array.isArray(r))
    .map((r): [string, string] => [str(r[0], 80), str(r[1], 300)])
    .filter(([k, val]) => k && val);
}

function normDoors(input: unknown): Result {
  if (!Array.isArray(input)) return { ok: false, error: 'Ожидался список дверей' };
  const out = [];
  for (const d of input) {
    if (!isRecord(d)) continue;
    const name = str(d.name, 160);
    if (!name) return { ok: false, error: 'У двери нет названия' };
    const gallery = strList(d.gallery, 20).filter(urlOk);
    const image = str(d.image, 300) && urlOk(str(d.image, 300)) ? str(d.image, 300) : gallery[0] ?? '';
    out.push({
      slug: str(d.slug, 100) || slugify(name),
      name,
      brand: str(d.brand, 120),
      style: str(d.style, 80),
      types: Array.isArray(d.types) && d.types.includes('ДО') ? ['ДО'] : ['ДГ'],
      description: str(d.description, 2000),
      colors: normColors(d.colors),
      sizes: strList(d.sizes, 30),
      specs: normSpecs(d.specs),
      hero: image,
      image,
      gallery: image && !gallery.includes(image) ? [image, ...gallery] : gallery,
      kind: d.kind === 'entrance' ? 'entrance' : 'interior',
      source: str(d.source, 300) || undefined,
    });
  }
  const dup = uniqueSlugs(out, 'Двери');
  return dup ? { ok: false, error: dup } : { ok: true, data: out };
}

/* ------------------------------------------------------------------ sofas */

function normSofas(input: unknown): Result {
  if (!Array.isArray(input)) return { ok: false, error: 'Ожидался список диванов' };
  const out = [];
  for (const s of input) {
    if (!isRecord(s)) continue;
    const name = str(s.name, 160);
    if (!name) return { ok: false, error: 'У модели нет названия' };
    const gallery = strList(s.gallery, 20).filter(urlOk);
    const image = str(s.image, 300) && urlOk(str(s.image, 300)) ? str(s.image, 300) : gallery[0] ?? '';
    out.push({
      slug: str(s.slug, 100) || slugify(name),
      name,
      brand: str(s.brand, 80) || 'Delavega',
      kind: s.kind === 'Кресло' ? 'Кресло' : 'Диван',
      description: str(s.description, 2000),
      frame: str(s.frame, 200),
      legs: str(s.legs, 200),
      filler: str(s.filler, 200),
      sizes: strList(s.sizes, 30),
      fabrics: normColors(s.fabrics).map(({ name: n, hex }) => ({ name: n, hex })),
      custom: Boolean(s.custom),
      specs: normSpecs(s.specs),
      hero: image,
      image,
      gallery: image && !gallery.includes(image) ? [image, ...gallery] : gallery,
    });
  }
  const dup = uniqueSlugs(out, 'Диваны');
  return dup ? { ok: false, error: dup } : { ok: true, data: out };
}

/* ------------------------------------------------------------------ portfolio / promotions / settings */

function normPortfolio(input: unknown): Result {
  if (!Array.isArray(input)) return { ok: false, error: 'Ожидался список проектов' };
  const out = [];
  for (const p of input) {
    if (!isRecord(p)) continue;
    const title = str(p.title, 160);
    if (!title) return { ok: false, error: 'У проекта нет названия' };
    const gallery = strList(p.gallery, 30).filter(urlOk);
    const cover = str(p.cover, 300) && urlOk(str(p.cover, 300)) ? str(p.cover, 300) : gallery[0] ?? '';
    if (!cover) return { ok: false, error: `У проекта «${title}» нет фото` };
    out.push({
      slug: str(p.slug, 100) || slugify(title),
      title,
      subtitle: str(p.subtitle, 200) || undefined,
      description: str(p.description, 3000) || undefined,
      kind: str(p.kind, 60) || 'Интерьер',
      year: Math.round(num(p.year)) || undefined,
      collections: strList(p.collections, 20),
      cover,
      gallery: gallery.includes(cover) ? gallery : [cover, ...gallery],
    });
  }
  const dup = uniqueSlugs(out, 'Портфолио');
  return dup ? { ok: false, error: dup } : { ok: true, data: out };
}

function normPromotions(input: unknown): Result {
  if (!Array.isArray(input)) return { ok: false, error: 'Ожидался список акций' };
  const out = [];
  for (const p of input) {
    if (!isRecord(p)) continue;
    const title = str(p.title, 160);
    if (!title) return { ok: false, error: 'У акции нет названия' };
    out.push({
      slug: str(p.slug, 100) || slugify(title),
      title,
      offer: str(p.offer, 40),
      description: str(p.description, 2000),
      until: /^\d{4}-\d{2}-\d{2}$/.test(str(p.until)) ? str(p.until) : '2099-12-31',
      imageSeed: str(p.imageSeed, 80) || 'promo',
      accent: Boolean(p.accent) || undefined,
    });
  }
  const dup = uniqueSlugs(out, 'Акции');
  return dup ? { ok: false, error: dup } : { ok: true, data: out };
}

const SETTINGS_KEYS = ['shortDescription', 'phone', 'phoneHref', 'whatsapp', 'whatsappNumber', 'email', 'street', 'address', 'hours', 'instagram'] as const;

function normSettings(input: unknown): Result {
  if (!isRecord(input)) return { ok: false, error: 'Ожидались настройки' };
  const out: Record<string, string> = {};
  for (const k of SETTINGS_KEYS) if (str(input[k], 500)) out[k] = str(input[k], 500);
  if (out.phone && !out.phoneHref) out.phoneHref = out.phone.replace(/[^\d+]/g, '');
  if (out.whatsapp && !/^https?:\/\//.test(out.whatsapp)) return { ok: false, error: 'WhatsApp — ссылка вида https://wa.me/996…' };
  return { ok: true, data: out };
}

export function validate(name: DataName, input: unknown): Result {
  switch (name) {
    case 'tiles':
      return normTiles(input);
    case 'doors':
      return normDoors(input);
    case 'sofas':
      return normSofas(input);
    case 'portfolio':
      return normPortfolio(input);
    case 'promotions':
      return normPromotions(input);
    case 'settings':
      return normSettings(input);
    case 'leads':
      return Array.isArray(input) ? { ok: true, data: input } : { ok: false, error: 'Ожидался список заявок' };
  }
}
