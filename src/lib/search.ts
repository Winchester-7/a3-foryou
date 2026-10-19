/**
 * Site search: a small in-memory index built on the server (SiteHeader) and
 * matched in the browser as the visitor types.
 * - word order does not matter ("мрамор белый" = "белый мрамор");
 * - every query word must match the start of some word in the entry, so
 *   "мрам", "1200" and "kerr" work while typing;
 * - a light Russian stemmer lets "дверь" find "двери", "ванная" find "ванной";
 * - ё = е, "1200x600"/"1200х600" = "1200×600".
 * @author Erbol king
 */

export type SearchKind = 'category' | 'collection' | 'product' | 'door' | 'sofa' | 'page';

export interface SearchDoc {
  href: string;
  title: string;
  subtitle: string;
  kind: SearchKind;
  image?: string;
  /** normalised words of everything searchable about the entry */
  words: string[];
  /** normalised words of the title only — matches there rank higher */
  titleWords: string[];
}

export const KIND_LABEL: Record<SearchKind, string> = {
  category: 'Раздел каталога',
  collection: 'Коллекция',
  product: 'Декор',
  door: 'Дверь',
  sofa: 'Мебель',
  page: 'Страница',
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/(\d)\s*[xх*]\s*(\d)/g, '$1×$2')
    .replace(/[«»"'().,;:!?/\\|+–—-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toWords(...parts: (string | undefined | null)[]): string[] {
  const set = new Set<string>();
  for (const p of parts) {
    if (!p) continue;
    for (const w of normalize(p).split(' ')) {
      if (!w) continue;
      set.add(w);
      // "1200×600" also answers to "1200" and "600"
      if (w.includes('×')) for (const n of w.split('×')) if (n) set.add(n);
    }
  }
  return Array.from(set);
}

const ENDINGS = ['ями', 'ами', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ой', 'ей', 'ий', 'ый', 'ую', 'юю', 'ов', 'ев', 'ах', 'ях', 'ам', 'ям', 'ом', 'ем', 'а', 'я', 'ы', 'и', 'е', 'у', 'ю', 'о', 'ь', 'й'];

/** Strips one common Russian ending; short words are left alone. */
export function stem(word: string): string {
  if (word.length < 5 || !/[а-я]/.test(word)) return word;
  for (const e of ENDINGS) if (word.endsWith(e) && word.length - e.length >= 4) return word.slice(0, -e.length);
  return word;
}

function wordScore(token: string, words: string[]): number {
  const s = stem(token);
  let best = 0;
  for (const w of words) {
    if (w === token) return 3;
    if (w.startsWith(token)) best = Math.max(best, 2);
    else if (s !== token && w.startsWith(s)) best = Math.max(best, 1);
  }
  return best;
}

const KIND_WEIGHT: Record<SearchKind, number> = { category: 4, collection: 3, door: 2, sofa: 2, product: 1, page: 0 };

export function search(index: SearchDoc[], query: string, limit = 12): SearchDoc[] {
  const tokens = toWords(query).filter((t) => !t.includes('×') || /\d/.test(t));
  if (!tokens.length || normalize(query).length < 2) return [];
  const scored: { doc: SearchDoc; score: number }[] = [];
  for (const doc of index) {
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      const inTitle = wordScore(t, doc.titleWords);
      const inAll = inTitle || wordScore(t, doc.words);
      if (!inAll) {
        ok = false;
        break;
      }
      score += inAll * 10 + inTitle * 6;
    }
    if (!ok) continue;
    score += KIND_WEIGHT[doc.kind];
    if (normalize(doc.title).startsWith(normalize(query))) score += 15;
    scored.push({ doc, score });
  }
  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title, 'ru'));
  return scored.slice(0, limit).map((s) => s.doc);
}
