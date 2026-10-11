/**
 * Admin commands of the Telegram bot. Every command edits a JSON data file
 * in the repository (tiles / doors / sofas / portfolio) and uploads photos to
 * public/uploads — the site rebuilds itself after the commit.
 * @author Erbol king
 */
import type { Collection, LookSlug, Product } from '@/lib/types';
import { readJson, updateJson, writeFile } from './github';
import { downloadPhoto, escapeHtml as h, type TgMessage } from './telegram';
import { colorHex, normSize, parseBrand, parseFields, parseLook, parseSurface, pick, slugify, toNumber } from './util';

const PATH = {
  tiles: 'src/data/tiles.json',
  doors: 'src/data/doors.json',
  sofas: 'src/data/sofas.json',
  portfolio: 'src/data/portfolio.json',
};

type TilesFile = { generated?: string; collections: Collection[] };
type Door = {
  slug: string; name: string; brand: string; style: string; types: string[]; description: string;
  colors: { name: string; hex: string; image?: string }[]; sizes: string[]; specs: [string, string][];
  hero: string; image: string; gallery: string[]; kind?: 'interior' | 'entrance'; source?: string;
};
type Sofa = {
  slug: string; name: string; brand: string; kind: 'Диван' | 'Кресло'; description: string; frame: string; legs: string;
  filler: string; sizes: string[]; fabrics: { name: string; hex: string }[]; custom: boolean; specs: [string, string][];
  hero: string; image: string; gallery: string[];
};
type Project = {
  slug: string; title: string; subtitle?: string; description?: string; kind: string; year?: number;
  collections?: string[]; cover: string; gallery: string[];
};

export const HELP = `<b>A3 FOR YOU — управление сайтом</b>

<b>Керамогранит</b>
/tiles [поиск] — список позиций
/add_tile — добавить (фото + подпись)
/del_tile <i>slug</i> — удалить позицию
/stock <i>slug</i> <i>размер</i> <i>м²</i> — изменить остаток
/photo <i>slug</i> — прикрепить фото (отправьте фото с этой подписью)

<b>Двери</b>
/doors [поиск] · /add_door · /del_door <i>slug</i>

<b>Диваны и кресла</b>
/sofas [поиск] · /add_sofa · /del_sofa <i>slug</i>

<b>Портфолио</b>
/projects · /add_project · /del_project <i>slug</i>

Чтобы добавить товар, отправьте <b>фото</b> с подписью. Пример:

<code>/add_tile
Коллекция: Герда
Название: Герда Грей
Бренд: идальго
Размер: 1200x600
Поверхность: матовая
Количество: 450
Артикул: G123</code>

Сайт обновится через 1–3 минуты после команды.`;

/* ------------------------------------------------------------------ helpers */

async function savePhoto(msg: TgMessage, folder: string, slug: string): Promise<string | null> {
  if (!msg.photo?.length) return null;
  const buf = await downloadPhoto(msg.photo);
  const rel = `uploads/${folder}/${slug}-${Date.now().toString(36)}.jpg`;
  await writeFile(`public/${rel}`, buf, `bot: фото ${folder}/${slug}`);
  return `/${rel}`;
}

const list = (items: string[], empty = 'Ничего не найдено.') =>
  items.length ? items.slice(0, 25).join('\n') + (items.length > 25 ? `\n… и ещё ${items.length - 25}` : '') : empty;

const matches = (q: string, ...vals: (string | undefined)[]) =>
  !q || vals.some((v) => v?.toLowerCase().includes(q.toLowerCase()));

/* ------------------------------------------------------------------ tiles */

async function tilesList(q: string): Promise<string> {
  const data = await readJson<TilesFile>(PATH.tiles).catch(() => null);
  if (!data) return 'Не удалось прочитать каталог.';
  const rows = data.collections.flatMap((c) =>
    c.products
      .filter((p) => matches(q, p.nameRu, p.name, p.article, c.nameRu, p.slug))
      .map((p) => {
        const m2 = Math.round((p.stock ?? []).reduce((n, s) => n + s.m2, 0));
        return `• <code>${h(p.slug)}</code> — ${h(p.nameRu)} (${h(c.nameRu)})${m2 ? `, ${m2} м²` : ''}`;
      }),
  );
  return list(rows);
}

async function addTile(msg: TgMessage, body: string): Promise<string> {
  const f = parseFields(body);
  const collectionName = pick(f, 'коллекция', 'collection');
  const name = pick(f, 'название', 'name');
  if (!collectionName || !name) return 'Нужны поля «Коллекция» и «Название». Пример: /help';

  const size = normSize(pick(f, 'размер', 'size') ?? '');
  const surface = parseSurface(pick(f, 'поверхность', 'surface'));
  const m2 = toNumber(pick(f, 'количество', 'м2', 'остаток', 'stock'));
  const article = pick(f, 'артикул', 'article');
  const slug = slugify(`${collectionName}-${name}`);
  const photo = await savePhoto(msg, 'tiles', slug);

  let created = '';
  await updateJson<TilesFile>(PATH.tiles, `bot: добавлен ${name}`, (data) => {
    const key = collectionName.toLowerCase();
    let col = data.collections.find((c) => [c.slug, c.name, c.nameRu].some((v) => v.toLowerCase() === key));
    if (!col) {
      const look = (parseLook(pick(f, 'тип', 'look')) ?? 'stone') as LookSlug;
      col = {
        slug: slugify(collectionName),
        name: collectionName,
        nameRu: collectionName,
        brand: parseBrand(pick(f, 'бренд', 'brand')) ?? 'idalgo',
        look,
        sizes: [], surfaces: [], thickness: '', applications: [], tagline: '', description: '',
        hero: '', gallery: [], swatches: [], products: [], stockM2: 0,
      };
      data.collections.push(col);
    }
    const existing = col.products.find((p) => p.slug === slug);
    const stockLine = { size, surface, pcs: 0, m2 };
    const product: Product = existing ?? {
      slug, name, nameRu: name, color: '', article, sizes: [], surfaces: [], image: '', images: [], stock: [],
    };
    if (!existing) col.products.push(product);
    if (article) product.article = article;
    if (photo) {
      product.image = product.image || photo;
      product.images = [...product.images, photo];
      product.noPhoto = false;
      col.hero = col.hero || photo;
      col.swatches = [...col.swatches, photo].slice(0, 8);
    } else if (!product.image) {
      product.noPhoto = true;
    }
    if (size || m2) {
      product.stock = [...(product.stock ?? []).filter((s) => !(s.size === size && s.surface === surface)), stockLine];
    }
    product.sizes = Array.from(new Set((product.stock ?? []).map((s) => s.size).filter(Boolean)));
    product.surfaces = Array.from(new Set((product.stock ?? []).map((s) => s.surface).filter(Boolean)));
    col.sizes = Array.from(new Set(col.products.flatMap((p) => p.sizes)));
    col.surfaces = Array.from(new Set(col.products.flatMap((p) => p.surfaces)));
    col.stockM2 = Math.round(col.products.reduce((n, p) => n + (p.stock ?? []).reduce((k, s) => k + s.m2, 0), 0));
    created = `${col.nameRu} / ${product.nameRu}`;
  });
  return `✅ Добавлено: <b>${h(created)}</b>\nSlug: <code>${slug}</code>${photo ? '\nФото загружено.' : '\nФото не приложено — отправьте его с подписью <code>/photo ' + slug + '</code>.'}`;
}

async function delTile(arg: string): Promise<string> {
  const slug = arg.trim();
  if (!slug) return 'Укажите slug: /del_tile <i>slug</i> (список: /tiles)';
  let done = '';
  await updateJson<TilesFile>(PATH.tiles, `bot: удалён ${slug}`, (data) => {
    for (const c of data.collections) {
      const p = c.products.find((x) => x.slug === slug);
      if (p) {
        c.products = c.products.filter((x) => x.slug !== slug);
        done = p.nameRu;
      }
    }
    // a collection without products disappears from the catalogue
    data.collections = data.collections.filter((c) => c.products.length > 0);
  });
  return done ? `🗑 Удалено: <b>${h(done)}</b>` : `Позиция <code>${h(slug)}</code> не найдена.`;
}

async function setStock(arg: string): Promise<string> {
  const [slug, sizeRaw, qtyRaw] = arg.trim().split(/\s+/);
  if (!slug || !sizeRaw || qtyRaw === undefined) return 'Формат: /stock <i>slug</i> <i>1200x600</i> <i>450</i>  (м²)';
  const size = normSize(sizeRaw);
  const m2 = toNumber(qtyRaw);
  let ok = false;
  await updateJson<TilesFile>(PATH.tiles, `bot: остаток ${slug} ${size}`, (data) => {
    for (const c of data.collections) {
      const p = c.products.find((x) => x.slug === slug);
      if (!p) continue;
      const line = (p.stock ??= []).find((s) => s.size === size);
      if (line) line.m2 = m2;
      else p.stock.push({ size, surface: '', pcs: 0, m2 });
      c.stockM2 = Math.round(c.products.reduce((n, q) => n + (q.stock ?? []).reduce((k, s) => k + s.m2, 0), 0));
      ok = true;
    }
  });
  return ok ? `✅ Остаток обновлён: ${h(slug)} · ${size} · ${m2} м²` : `Позиция <code>${h(slug)}</code> не найдена.`;
}

async function attachPhoto(msg: TgMessage, arg: string): Promise<string> {
  const slug = arg.trim();
  if (!slug) return 'Отправьте фото с подписью: /photo <i>slug</i>';
  const url = await savePhoto(msg, 'tiles', slug);
  if (!url) return 'К команде нужно приложить фото.';
  let ok = false;
  await updateJson<TilesFile>(PATH.tiles, `bot: фото ${slug}`, (data) => {
    for (const c of data.collections) {
      const p = c.products.find((x) => x.slug === slug);
      if (!p) continue;
      p.image = p.image || url;
      p.images = [...p.images, url];
      p.noPhoto = false;
      c.hero = c.hero || url;
      c.swatches = [...c.swatches, url].slice(0, 8);
      ok = true;
    }
  });
  return ok ? '✅ Фото добавлено.' : `Позиция <code>${h(slug)}</code> не найдена.`;
}

/* ------------------------------------------------------------------ doors */

async function doorsList(q: string): Promise<string> {
  const data = await readJson<Door[]>(PATH.doors).catch(() => null);
  if (!data) return 'Не удалось прочитать каталог дверей.';
  return list(data.filter((d) => matches(q, d.name, d.slug, d.style)).map((d) => `• <code>${h(d.slug)}</code> — ${h(d.name)}`));
}

async function addDoor(msg: TgMessage, body: string): Promise<string> {
  const f = parseFields(body);
  const name = pick(f, 'название', 'name');
  if (!name) return 'Нужно поле «Название». Пример: /help';
  const slug = slugify(name);
  const photo = await savePhoto(msg, 'doors', slug);
  const color = pick(f, 'цвет', 'color') ?? 'Белый';
  const entrance = /вход/i.test(pick(f, 'вид', 'тип', 'kind') ?? '');
  const sizesRaw = pick(f, 'размеры', 'размер', 'sizes');
  const sizes = sizesRaw ? sizesRaw.split(/[;,]/).map((s) => s.trim().replace(/\s*[xх*×]\s*/i, ' × ')) : ['800 × 2000'];
  const door: Door = {
    slug,
    name,
    brand: pick(f, 'серия', 'бренд', 'brand') ?? '',
    style: pick(f, 'стиль', 'style') ?? '',
    types: [/стекл|остекл/i.test(pick(f, 'остекление') ?? '') ? 'ДО' : 'ДГ'],
    description: pick(f, 'описание', 'description') ?? '',
    colors: [{ name: color, hex: colorHex(color), ...(photo ? { image: photo } : {}) }],
    sizes,
    specs: [['Цвет', color]],
    hero: photo ?? '',
    image: photo ?? '',
    gallery: photo ? [photo] : [],
    kind: entrance ? 'entrance' : 'interior',
  };
  await updateJson<Door[]>(PATH.doors, `bot: добавлена дверь ${name}`, (all) => {
    const i = all.findIndex((d) => d.slug === slug);
    if (i >= 0) all[i] = door;
    else all.push(door);
  });
  return `✅ Дверь добавлена: <b>${h(name)}</b>\nSlug: <code>${slug}</code>`;
}

async function delDoor(arg: string): Promise<string> {
  const slug = arg.trim();
  let found = false;
  await updateJson<Door[]>(PATH.doors, `bot: удалена дверь ${slug}`, (all) => {
    const next = all.filter((d) => d.slug !== slug);
    found = next.length !== all.length;
    return next;
  });
  return found ? '🗑 Дверь удалена.' : `Дверь <code>${h(slug)}</code> не найдена.`;
}

/* ------------------------------------------------------------------ sofas */

const FABRICS = [
  { name: 'Латте', hex: '#cdbfa8' },
  { name: 'Тауп', hex: '#9a8f80' },
  { name: 'Графит', hex: '#4c4d4f' },
  { name: 'Олива', hex: '#6f6b49' },
  { name: 'Терракота', hex: '#a45c43' },
  { name: 'Индиго', hex: '#3f4a63' },
];

async function sofasList(q: string): Promise<string> {
  const data = await readJson<Sofa[]>(PATH.sofas).catch(() => null);
  if (!data) return 'Не удалось прочитать каталог диванов.';
  return list(data.filter((s) => matches(q, s.name, s.slug)).map((s) => `• <code>${h(s.slug)}</code> — ${h(s.kind)} ${h(s.name)}`));
}

async function addSofa(msg: TgMessage, body: string): Promise<string> {
  const f = parseFields(body);
  const name = pick(f, 'название', 'name');
  if (!name) return 'Нужно поле «Название». Пример: /help';
  const slug = slugify(name);
  const photo = await savePhoto(msg, 'sofas', slug);
  const kind: Sofa['kind'] = /кресл/i.test(pick(f, 'вид', 'тип', 'kind') ?? '') ? 'Кресло' : 'Диван';
  const sizesRaw = pick(f, 'размеры', 'размер', 'sizes');
  const sizes = sizesRaw ? sizesRaw.split(/[;,]/).map((s) => s.trim().replace(/\s*[xх*×]\s*/i, ' × ')) : ['200 × 95'];
  const sofa: Sofa = {
    slug, name, brand: pick(f, 'бренд', 'brand') ?? 'Delavega', kind,
    description: pick(f, 'описание', 'description') ?? '',
    frame: 'Массив дерева, фанера', legs: '', filler: '', sizes, fabrics: FABRICS, custom: false, specs: [],
    hero: photo ?? '', image: photo ?? '', gallery: photo ? [photo] : [],
  };
  await updateJson<Sofa[]>(PATH.sofas, `bot: добавлен ${kind.toLowerCase()} ${name}`, (all) => {
    const i = all.findIndex((s) => s.slug === slug);
    if (i >= 0) all[i] = sofa;
    else all.push(sofa);
  });
  return `✅ ${kind} добавлен: <b>${h(name)}</b>\nSlug: <code>${slug}</code>`;
}

async function delSofa(arg: string): Promise<string> {
  const slug = arg.trim();
  let found = false;
  await updateJson<Sofa[]>(PATH.sofas, `bot: удалён диван ${slug}`, (all) => {
    const next = all.filter((s) => s.slug !== slug);
    found = next.length !== all.length;
    return next;
  });
  return found ? '🗑 Удалено.' : `Модель <code>${h(slug)}</code> не найдена.`;
}

/* ------------------------------------------------------------------ portfolio */

async function projectsList(): Promise<string> {
  const data = await readJson<Project[]>(PATH.portfolio).catch(() => null);
  if (!data) return 'Не удалось прочитать портфолио.';
  return list(data.map((p) => `• <code>${h(p.slug)}</code> — ${h(p.title)}`), 'Портфолио пока пустое.');
}

async function addProject(msg: TgMessage, body: string): Promise<string> {
  const f = parseFields(body);
  const title = pick(f, 'название', 'title');
  if (!title) return 'Нужно поле «Название». Пример: /help';
  const slug = slugify(title);
  const photo = await savePhoto(msg, 'portfolio', slug);
  if (!photo) return 'Для проекта нужно приложить хотя бы одно фото.';
  const project: Project = {
    slug,
    title,
    subtitle: pick(f, 'подзаголовок', 'subtitle'),
    description: pick(f, 'описание', 'description'),
    kind: pick(f, 'тип', 'kind') ?? 'Интерьер',
    year: toNumber(pick(f, 'год', 'year')) || undefined,
    collections: pick(f, 'коллекции', 'collections')?.split(/[;,]/).map((s) => s.trim()).filter(Boolean),
    cover: photo,
    gallery: [photo],
  };
  await updateJson<Project[]>(PATH.portfolio, `bot: проект ${title}`, (all) => {
    const i = all.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      all[i] = { ...all[i], ...project, gallery: [...all[i].gallery, photo] };
    } else {
      all.unshift(project);
    }
  });
  return `✅ Проект добавлен: <b>${h(title)}</b>\nSlug: <code>${slug}</code>`;
}

async function delProject(arg: string): Promise<string> {
  const slug = arg.trim();
  let found = false;
  await updateJson<Project[]>(PATH.portfolio, `bot: удалён проект ${slug}`, (all) => {
    const next = all.filter((p) => p.slug !== slug);
    found = next.length !== all.length;
    return next;
  });
  return found ? '🗑 Проект удалён.' : `Проект <code>${h(slug)}</code> не найден.`;
}

/* ------------------------------------------------------------------ router */

export async function runCommand(msg: TgMessage): Promise<string> {
  const raw = (msg.text ?? msg.caption ?? '').trim();
  if (!raw.startsWith('/')) return 'Отправьте команду. Список — /help';

  const nl = raw.indexOf('\n');
  const first = nl === -1 ? raw : raw.slice(0, nl);
  const body = nl === -1 ? '' : raw.slice(nl + 1);
  const [cmdRaw, ...rest] = first.split(/\s+/);
  const cmd = cmdRaw.replace(/^\//, '').replace(/@.*$/, '').toLowerCase();
  const arg = rest.join(' ');
  // fields may follow the command on the same line as well as on the next lines
  const fieldsText = [rest.join('\n'), body].join('\n');

  switch (cmd) {
    case 'start':
    case 'help':
      return HELP;
    case 'tiles':
      return tilesList(arg);
    case 'add_tile':
      return addTile(msg, fieldsText);
    case 'del_tile':
      return delTile(arg);
    case 'stock':
      return setStock(arg);
    case 'photo':
      return attachPhoto(msg, arg);
    case 'doors':
      return doorsList(arg);
    case 'add_door':
      return addDoor(msg, fieldsText);
    case 'del_door':
      return delDoor(arg);
    case 'sofas':
      return sofasList(arg);
    case 'add_sofa':
      return addSofa(msg, fieldsText);
    case 'del_sofa':
      return delSofa(arg);
    case 'projects':
      return projectsList();
    case 'add_project':
      return addProject(msg, fieldsText);
    case 'del_project':
      return delProject(arg);
    default:
      return 'Неизвестная команда. Список — /help';
  }
}
