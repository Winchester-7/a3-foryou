/**
 * Slug helper (Russian -> latin). Pure — used by the admin panel and the API.
 * @author Erbol king
 */
const TR: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ө: 'o', ү: 'u', ң: 'n',
};

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .split('')
    .map((ch) => TR[ch] ?? ch)
    .join('');
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

/** Makes `base` unique among `taken` by adding -2, -3… */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
