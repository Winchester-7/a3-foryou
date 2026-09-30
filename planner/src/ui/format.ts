/** Russian number formatting: 2.5 → "2,5", 12 → "12". */
export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
