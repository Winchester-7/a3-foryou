/**
 * Parsing helpers for the admin bot: transliteration, "Key: value" captions,
 * and normalisation of sizes / brands / looks typed by hand.
 * @author Erbol king
 */
import type { Brand, LookSlug } from '@/lib/types';

const TR: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .split('')
    .map((ch) => TR[ch] ?? ch)
    .join('');
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

/** "Ключ: значение" lines -> map with lower-cased keys. */
export function parseFields(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([^:：]{1,32})[:：]\s*(.+?)\s*$/);
    if (m) out[m[1].trim().toLowerCase().replace(/ё/g, 'е')] = m[2];
  }
  return out;
}

export function pick(fields: Record<string, string>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = fields[k.toLowerCase().replace(/ё/g, 'е')];
    if (v) return v;
  }
  return undefined;
}

/** "120*60", "1200x600", "60 х 60" -> "1200×600" (mm, long side first). */
export function normSize(raw: string): string {
  const m = raw.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[*xх×X]\s*(\d+(?:\.\d+)?)/i);
  if (!m) return raw.trim();
  let a = parseFloat(m[1]);
  let b = parseFloat(m[2]);
  if (a < 10) {
    a *= 1000;
    b *= 1000;
  } else if (a <= 200 && b <= 200) {
    a *= 10;
    b *= 10;
  }
  const [long, short] = a >= b ? [a, b] : [b, a];
  return `${Math.round(long)}×${Math.round(short)}`;
}

const BRANDS: Record<string, Brand> = {
  idalgo: 'idalgo', идальго: 'idalgo',
  granitea: 'granitea', гранитея: 'granitea',
  uralgranit: 'uralgranit', 'уральский гранит': 'uralgranit',
  grasaro: 'grasaro', грасаро: 'grasaro',
  kerranova: 'kerranova', керранова: 'kerranova', керанова: 'kerranova',
  china: 'china', китай: 'china',
  axima: 'axima', аксима: 'axima',
  kazakhstan: 'kazakhstan', казахстан: 'kazakhstan',
  uzbekistan: 'uzbekistan', узбекистан: 'uzbekistan',
  tianshan: 'tianshan', 'тянь-шань': 'tianshan', 'тянь шань': 'tianshan',
};

export function parseBrand(raw?: string): Brand | undefined {
  return raw ? BRANDS[raw.trim().toLowerCase()] : undefined;
}

const LOOKS: Record<string, LookSlug> = {
  мрамор: 'marble', marble: 'marble',
  камень: 'stone', stone: 'stone',
  дерево: 'wood', wood: 'wood',
  бетон: 'concrete', concrete: 'concrete',
  лофт: 'loft', loft: 'loft',
  фасад: 'facade', facade: 'facade',
  технический: 'technical', technical: 'technical',
};

export function parseLook(raw?: string): LookSlug | undefined {
  return raw ? LOOKS[raw.trim().toLowerCase()] : undefined;
}

const SURFACES: Record<string, string> = {
  mr: 'Матовая', матовая: 'Матовая', матовый: 'Матовая',
  pr: 'Полированная', полированная: 'Полированная', полированный: 'Полированная',
  lr: 'Лаппатированная', llr: 'Лаппатированная', лаппатированная: 'Лаппатированная',
  sr: 'Структурная', структурная: 'Структурная',
};

export function parseSurface(raw?: string): string {
  if (!raw) return '';
  return SURFACES[raw.trim().toLowerCase()] ?? raw.trim();
}

export const toNumber = (raw?: string): number => {
  const n = parseFloat((raw ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const COLOR_HEX: [RegExp, string][] = [
  [/бел/i, '#f2f0ec'], [/черн|чёрн/i, '#232323'], [/серый|серая|графит|антрацит/i, '#8f8f8d'],
  [/венге/i, '#3b2f2a'], [/орех/i, '#6b4a2f'], [/ясень/i, '#cbb89d'], [/дуб/i, '#b08a62'],
  [/беж|ванил|слон|крем/i, '#d8ccb9'], [/коричн|шоколад|каштан/i, '#5a3f2e'], [/золот/i, '#c8a45c'],
  [/красн|бордо/i, '#8c2a2a'], [/син|голуб/i, '#3f4a63'], [/зелен|зелён|олив/i, '#6f6b49'],
];

export function colorHex(name: string): string {
  return COLOR_HEX.find(([re]) => re.test(name))?.[1] ?? '#b9a38a';
}
