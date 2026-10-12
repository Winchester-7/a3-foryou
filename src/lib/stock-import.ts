/**
 * Import of the warehouse list (.xlsx, one sheet per factory) into the tile catalogue.
 *
 * The workbook is matched against the products that are already on the site:
 *   1. by the original line name kept in the stock line («G 202 MR (60*60)»),
 *   2. by the article code inside the same factory,
 *   3. by a fuzzy comparison of the name (for factories without codes).
 * Rows that match nothing become new products without a photo (optional).
 * Server-only. Same rules as scripts/import/{parse_stock,match_stock}.py.
 * @author Erbol king
 */
import readXlsxFile from 'read-excel-file/node';
import type { Collection, Product, StockLine } from './types';
import type { TilesFile } from './collections';
import { slugify } from './slug';

/* ------------------------------------------------------------------ rows */

export interface StockRow {
  sheet: string;
  factory: string;
  raw: string;
  code: string;
  surface: string;
  size: string;
  pcs: number;
  m2: number;
}

/** sheet title -> factory key, the key is also the brand key of the catalogue */
const FACTORY: Record<string, { key: string; ru: string; en: string }> = {
  гранитея: { key: 'granitea', ru: 'Гранитея', en: 'Granitea' },
  китай: { key: 'china', ru: 'Китай', en: 'China' },
  грасаро: { key: 'grasaro', ru: 'Грасаро', en: 'Grasaro' },
  керанова: { key: 'kerranova', ru: 'Керранова', en: 'Kerranova' },
  керранова: { key: 'kerranova', ru: 'Керранова', en: 'Kerranova' },
  идальго: { key: 'idalgo', ru: 'Идальго', en: 'Idalgo' },
  аксима: { key: 'axima', ru: 'Аксима', en: 'Axima' },
  казахстан: { key: 'kazakhstan', ru: 'Казахстан', en: 'Kazakhstan' },
  узбекстан: { key: 'uzbekistan', ru: 'Узбекистан', en: 'Uzbekistan' },
  узбекистан: { key: 'uzbekistan', ru: 'Узбекистан', en: 'Uzbekistan' },
  'тянь шань': { key: 'tianshan', ru: 'Тянь-Шань', en: 'Tian Shan' },
  'тянь-шань': { key: 'tianshan', ru: 'Тянь-Шань', en: 'Tian Shan' },
};

/** factories whose products may be filed under another brand key in the catalogue */
const BRAND_FACTORY: Record<string, string> = { uralgranit: 'granitea' };
const factoryOfBrand = (brand: string) => BRAND_FACTORY[brand] ?? brand;

const SURFACE_RU: Record<string, string> = {
  MR: 'Матовая',
  LLR: 'Лаппатированная',
  LR: 'Лаппатированная',
  PR: 'Полированная',
  SR: 'Структурная',
  LMR: 'Мягкая матовая',
};

const LOOKALIKE: Record<string, string> = {
  М: 'M', Р: 'R', Л: 'L', П: 'P', С: 'S', Т: 'T', К: 'K', Г: 'G', Н: 'N', О: 'O', Е: 'E', А: 'A', В: 'B', Х: 'X', У: 'Y',
  м: 'm', р: 'r', л: 'l', п: 'p', с: 's',
};
const toLatin = (s: string) => s.replace(/[А-Яа-я]/g, (ch) => LOOKALIKE[ch] ?? ch);
/** comparison key: lower case, Cyrillic look-alikes -> Latin, only letters and digits */
const keyOf = (s: string) => toLatin(s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');

/** «60*60», «(600*1200*)» -> «600×600» (long side first, millimetres) */
function sizeFrom(name: string, perPiece: number): string {
  const m = name.match(/\(?\s*(\d{2,4}(?:[.,]\d)?)\s*[*xх×]\s*(\d{2,4}(?:[.,]\d)?)\s*\)?/);
  if (m) {
    let a = parseFloat(m[1].replace(',', '.'));
    let b = parseFloat(m[2].replace(',', '.'));
    if (a < 10) {
      a *= 1000;
      b *= 1000;
    } else if (a <= 200 && b <= 200 && b !== 195) {
      a *= 10;
      b *= 10;
    }
    a = Math.round(a);
    b = Math.round(b);
    return a < b ? `${b}×${a}` : `${a}×${b}`;
  }
  const byArea: Record<string, string> = { '0.36': '600×600', '0.72': '1200×600', '0.24': '1200×200', '0.32': '800×400', '0.34': '580×580' };
  return byArea[(Math.round(perPiece * 1000) / 1000).toString()] ?? '';
}

const cellNum = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export interface ParsedWorkbook {
  rows: StockRow[];
  sheets: { sheet: string; factory: string; known: boolean; rows: number }[];
}

export async function parseWorkbook(buf: Buffer): Promise<ParsedWorkbook> {
  const book = await readXlsxFile(buf);
  const rows: StockRow[] = [];
  const sheets: ParsedWorkbook['sheets'] = [];

  for (const { sheet, data } of book) {
    const title = String(sheet).trim();
    const factory = FACTORY[title.toLowerCase()];
    const key = factory?.key ?? slugify(title) ?? title;
    let count = 0;

    for (const cells of data.slice(1)) {
      const name = cells[1];
      const pcsRaw = cellNum(cells[3]);
      if (typeof name !== 'string' || !name.trim() || pcsRaw === null) continue;

      const raw = name.replace(/\s+/g, ' ').trim();
      const latin = toLatin(raw);
      const perPiece = cellNum(cells[2]) ?? 0;
      const pcs = Math.max(0, Math.round(pcsRaw));
      const m2Raw = cellNum(cells[4]);
      const m2 = Math.max(0, Math.round((m2Raw ?? pcs * perPiece) * 100) / 100);
      const codeM = latin.match(/^(?:ГР\s*)?([A-Z]{1,3})[\s-]?(\d{2,5})(?![0-9])/);
      const surfM = latin.toUpperCase().match(/(?<![A-Z])(LLR|LMR|MR|PR|LR|SR)(?![A-Z])/);

      rows.push({
        sheet: title,
        factory: key,
        raw,
        code: codeM ? `${codeM[1]}${codeM[2]}` : '',
        surface: surfM ? SURFACE_RU[surfM[1]] ?? surfM[1] : '',
        size: sizeFrom(raw, perPiece),
        pcs: pcs === 0 ? 0 : pcs,
        m2: pcs === 0 ? 0 : m2,
      });
      count += 1;
    }
    sheets.push({ sheet: title, factory: key, known: Boolean(factory), rows: count });
  }
  return { rows, sheets };
}

/* ------------------------------------------------------------------ names */

/** Russian product name without surface, size and tile codes — for fuzzy matching. */
function normName(s: string): string {
  const L = '[a-zа-я0-9]';
  let t = s.toLowerCase().replace(/ё/g, 'е');
  t = t.replace(/\(.*?\)/g, ' ');
  t = t.replace(new RegExp(`(?<!${L})(llr|lmr|mr|pr|lr|sr|ллр|мр|пр|лр|ср)(?!${L})`, 'g'), ' ');
  t = t.replace(new RegExp(`(?<!${L})(t|т|tk|тк|tc|тс|m|tn|т-к|т-n|tkk)[-\\s]?${L}*\\d+${L}*(?!${L})`, 'g'), ' ');
  t = t.replace(/\d+[.,]?\d*\s*[*xх×]\s*\d+[.,]?\d*/g, ' ');
  t = t.replace(/[^a-zа-я0-9 ]+/g, ' ');
  const swaps: [string, string][] = [
    ['классик', 'класик'], ['бейдж', 'беж'], ['бежевый', 'беж'], ['вайт', 'белый'], ['блек', 'черный'], ['лайт', 'светлый'],
    ['грей', 'серый'], ['дарк', 'темный'], ['натурал', 'натура'], ['браун', 'коричневый'], ['арабеско', 'арабеска'],
    ['верд', 'зеленый'], ['каролина', 'королина'], ['доломинти', 'доломиты'], ['сасс', 'сас'], ['ардженто', 'серебряный'],
  ];
  for (const [a, b] of swaps) t = t.split(a).join(b);
  return t.replace(/\s+/g, ' ').trim();
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ta = new Set(a.split(' '));
  const tb = new Set(b.split(' '));
  const [small, big] = ta.size <= tb.size ? [ta, tb] : [tb, ta];
  if (Array.from(small).every((t) => big.has(t))) return 0.9;
  const grams = (s: string) => {
    const x = s.replace(/ /g, '');
    const out = new Map<string, number>();
    for (let i = 0; i < x.length - 1; i++) out.set(x.slice(i, i + 2), (out.get(x.slice(i, i + 2)) ?? 0) + 1);
    return out;
  };
  const ga = grams(a);
  const gb = grams(b);
  let hit = 0;
  let total = 0;
  ga.forEach((n, g) => {
    total += n;
    hit += Math.min(n, gb.get(g) ?? 0);
  });
  gb.forEach((n) => (total += n));
  return total ? (2 * hit) / total : 0;
}

/* ------------------------------------------------------------------ plan */

export type HowMatched = 'label' | 'code' | 'name';

export interface ProductChange {
  collection: string;
  product: string;
  how: HowMatched | 'new' | 'zeroed';
  score?: number;
  beforePcs: number;
  afterPcs: number;
  beforeM2: number;
  afterM2: number;
}

export interface ImportOptions {
  /** rows that match no product become new products (without a photo) */
  addNew: boolean;
  /** products of the factories present in the file that are not listed there get zero stock */
  zeroMissing: boolean;
}

export interface ImportReport {
  sheets: ParsedWorkbook['sheets'];
  rows: number;
  rowsInStock: number;
  matched: Record<HowMatched, number>;
  created: number;
  zeroed: number;
  unchanged: number;
  m2Before: number;
  m2After: number;
  changes: ProductChange[];
  unmatched: { sheet: string; raw: string; pcs: number; m2: number; created: boolean }[];
  warnings: string[];
}

const sumPcs = (l: StockLine[] | undefined) => (l ?? []).reduce((n, s) => n + s.pcs, 0);
const sumM2 = (l: StockLine[] | undefined) => Math.round((l ?? []).reduce((n, s) => n + s.m2, 0) * 100) / 100;

function mergeLines(rows: StockRow[]): StockLine[] {
  const merged = new Map<string, StockLine>();
  for (const r of rows) {
    if (r.pcs <= 0) continue;
    const k = `${r.size}|${r.surface}`;
    const cur = merged.get(k);
    if (cur) {
      cur.pcs += r.pcs;
      cur.m2 = Math.round((cur.m2 + r.m2) * 100) / 100;
    } else merged.set(k, { size: r.size, surface: r.surface, pcs: r.pcs, m2: r.m2, label: r.raw });
  }
  return Array.from(merged.values());
}

const prettyName = (raw: string) =>
  raw
    .replace(/\(.*?\)/g, ' ')
    .replace(/(?<![A-Za-z])(MR|PR|LR|SR|LLR|LMR)(?![A-Za-z])/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[ *]+|[ *]+$/g, '');

const STONE_APPLICATIONS = ['Гостиные', 'Ванные комнаты', 'Кухни', 'Террасы', 'Коммерческие интерьеры', 'Входные группы'];

/**
 * Pure function: returns the new catalogue and the report; nothing is written here.
 */
export function planImport(current: TilesFile, parsed: ParsedWorkbook, opts: ImportOptions): { next: TilesFile; report: ImportReport } {
  const next: TilesFile = structuredClone(current);
  const collections = next.collections ?? [];
  const report: ImportReport = {
    sheets: parsed.sheets,
    rows: parsed.rows.length,
    rowsInStock: parsed.rows.filter((r) => r.pcs > 0).length,
    matched: { label: 0, code: 0, name: 0 },
    created: 0,
    zeroed: 0,
    unchanged: 0,
    m2Before: 0,
    m2After: 0,
    changes: [],
    unmatched: [],
    warnings: [],
  };

  for (const s of parsed.sheets) if (!s.known) report.warnings.push(`Лист «${s.sheet}» не распознан как завод: новые позиции из него не создаются`);

  type Ref = { col: Collection; p: Product; factory: string; before: StockLine[] };
  const refs: Ref[] = collections.flatMap((col) =>
    col.products.map((p) => ({ col, p, factory: factoryOfBrand(col.brand), before: (p.stock ?? []).map((s) => ({ ...s })) })),
  );
  report.m2Before = Math.round(refs.reduce((n, r) => n + sumM2(r.before), 0) * 10) / 10;

  const byLabel = new Map<string, Ref[]>();
  const byArticle = new Map<string, Ref[]>();
  for (const r of refs) {
    for (const line of r.p.stock ?? []) {
      const k = line.label ? keyOf(line.label) : '';
      if (k) byLabel.set(k, [...(byLabel.get(k) ?? []), r]);
    }
    const a = r.p.article ? keyOf(r.p.article) : '';
    if (a) byArticle.set(a, [...(byArticle.get(a) ?? []), r]);
  }
  const names = new Map<Ref, string[]>();
  for (const r of refs) names.set(r, [r.p.nameRu, r.p.name].filter(Boolean).map(normName).filter(Boolean));

  const pick = (list: Ref[] | undefined, factory: string) => list?.find((x) => x.factory === factory) ?? list?.[0];

  const assigned = new Map<Ref, { rows: StockRow[]; how: HowMatched; score?: number }>();
  const fresh = new Map<string, StockRow[]>();

  for (const row of parsed.rows) {
    let ref = pick(byLabel.get(keyOf(row.raw)), row.factory);
    let how: HowMatched = 'label';
    let score: number | undefined;

    if (!ref && row.code) {
      ref = byArticle.get(keyOf(row.code))?.find((x) => x.factory === row.factory);
      how = 'code';
    }
    if (!ref) {
      const target = normName(row.raw);
      let best: Ref | undefined;
      let bestScore = 0;
      for (const r of refs) {
        if (r.factory !== row.factory) continue;
        for (const n of names.get(r) ?? []) {
          const sc = similarity(target, n);
          if (sc > bestScore) {
            best = r;
            bestScore = sc;
          }
        }
      }
      // names are compared only where the factory gives no article codes
      if (best && bestScore >= 0.8 && !row.code) {
        ref = best;
        how = 'name';
        score = Math.round(bestScore * 100) / 100;
      }
    }

    if (ref) {
      const slot = assigned.get(ref) ?? { rows: [], how, score };
      slot.rows.push(row);
      // keep the weakest evidence for the report
      if (how === 'name' || (how === 'code' && slot.how === 'label')) {
        slot.how = how;
        slot.score = score ?? slot.score;
      }
      assigned.set(ref, slot);
      report.matched[how] += 1;
      continue;
    }

    const base = row.raw
      .replace(/\(.*?\)|(?<![A-Za-z])(MR|PR|LR|SR|LLR|LMR)(?![A-Za-z])|(?<![a-zа-я0-9])[тt]-?\d+[a-zа-я0-9]*/gi, '')
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/g, '');
    const groupKey = `${row.factory}:${base || keyOf(row.raw)}`;
    fresh.set(groupKey, [...(fresh.get(groupKey) ?? []), row]);
  }

  /* ---- existing products: replace the stock ---- */
  const factoriesInFile = new Set(parsed.sheets.map((s) => s.factory));
  for (const r of refs) {
    const hit = assigned.get(r);
    if (!hit && !(opts.zeroMissing && factoriesInFile.has(r.factory))) continue;
    const after = hit ? mergeLines(hit.rows) : [];
    const beforePcs = sumPcs(r.before);
    const beforeM2 = sumM2(r.before);
    const afterPcs = sumPcs(after);
    const afterM2 = sumM2(after);
    r.p.stock = after;
    if (after.length) {
      r.p.sizes = Array.from(new Set(after.map((s) => s.size).filter(Boolean)));
      r.p.surfaces = Array.from(new Set(after.map((s) => s.surface).filter(Boolean)));
    }
    if (!hit) {
      if (beforePcs > 0) {
        report.zeroed += 1;
        report.changes.push({ collection: r.col.nameRu, product: r.p.nameRu, how: 'zeroed', beforePcs, afterPcs: 0, beforeM2, afterM2: 0 });
      }
    } else if (beforePcs === afterPcs && beforeM2 === afterM2) {
      report.unchanged += 1;
    } else {
      report.changes.push({ collection: r.col.nameRu, product: r.p.nameRu, how: hit.how, score: hit.score, beforePcs, afterPcs, beforeM2, afterM2 });
    }
  }

  /* ---- new products ---- */
  const takenSlugs = new Set(collections.flatMap((c) => c.products.map((p) => p.slug)));
  for (const rows of Array.from(fresh.values())) {
    const known = parsed.sheets.find((s) => s.factory === rows[0].factory)?.known ?? false;
    const inStock = rows.filter((r) => r.pcs > 0);
    const create = opts.addNew && known && inStock.length > 0;
    for (const r of rows) {
      if (r.pcs > 0 || !create) report.unmatched.push({ sheet: r.sheet, raw: r.raw, pcs: r.pcs, m2: r.m2, created: create });
    }
    if (!create) continue;

    const meta = Object.values(FACTORY).find((f) => f.key === rows[0].factory)!;
    const cslug = `${meta.key}-stock`;
    let col = collections.find((c) => c.slug === cslug);
    if (!col) {
      col = {
        slug: cslug, name: meta.en, nameRu: meta.ru, brand: meta.key as Collection['brand'], look: 'stone',
        sizes: [], surfaces: [], thickness: '', applications: STONE_APPLICATIONS, tagline: '', description: '',
        hero: '', gallery: [], swatches: [], products: [],
      };
      collections.push(col);
    }
    const nameRu = prettyName(rows[0].raw) || rows[0].raw;
    let slug = slugify(`${meta.key}-${nameRu}`) || `${meta.key}-item`;
    for (let i = 2; takenSlugs.has(slug); i++) slug = `${slugify(`${meta.key}-${nameRu}`)}-${i}`;
    takenSlugs.add(slug);

    const stock = mergeLines(rows);
    col.products.push({
      slug,
      name: nameRu,
      nameRu,
      color: '',
      article: rows[0].code || undefined,
      sizes: Array.from(new Set(stock.map((s) => s.size).filter(Boolean))),
      surfaces: Array.from(new Set(stock.map((s) => s.surface).filter(Boolean))),
      image: '',
      images: [],
      stock,
      noPhoto: true,
    });
    report.created += 1;
    report.changes.push({ collection: col.nameRu, product: nameRu, how: 'new', beforePcs: 0, afterPcs: sumPcs(stock), beforeM2: 0, afterM2: sumM2(stock) });
  }

  const inScope = refs.filter((r) => factoriesInFile.has(r.factory) && sumM2(r.before) > 0).length;
  if (opts.zeroMissing && inScope >= 5 && report.zeroed / inScope > 0.4) {
    report.warnings.push(
      `Обнулится ${report.zeroed} из ${inScope} позиций, которые сейчас в наличии. Проверьте, что файл полный (все листы и строки).`,
    );
  }

  report.m2After = Math.round(
    collections.reduce((n, c) => n + c.products.reduce((k, p) => k + sumM2(p.stock), 0), 0) * 10,
  ) / 10;
  next.generated = new Date().toISOString().slice(0, 10);
  report.changes.sort((a, b) => Math.abs(b.afterM2 - b.beforeM2) - Math.abs(a.afterM2 - a.beforeM2));
  return { next, report };
}
