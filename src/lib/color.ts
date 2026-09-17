/** Best-effort mapping of Russian colour / decor words to a swatch hex. */
const MAP: [RegExp, string][] = [
  [/бел|bianco|white|санто|арктик|молочн|снеж|айс/i, '#f1efe9'],
  [/слонов|ivory|крем|cream|велюр|светло-беж/i, '#e9e0cf'],
  [/беж|beige|песоч|дюна|sand|натур/i, '#dccbb0'],
  [/оро|oro|золот|gold|медов|honey|карамель|янтар/i, '#c9a367'],
  [/тауп|taupe|гридж|grigio|grey|сер(ый|о)|silver|перл|pearl|дым/i, '#a7a29a'],
  [/светло-сер|light grey|небиа|nebbia|туман/i, '#c6c3bd'],
  [/графит|graphite|антрацит|anthracite|тёмно-сер|темно-сер/i, '#494c4e'],
  [/неро|nero|чёрн|черн|black|базальт|basalt|асфальт/i, '#2c2d2e'],
  [/мокко|mocca|коричн|brown|шокол|табак|орех|walnut|бронз|bronze/i, '#6f4f3a'],
  [/терра|terra|кирпич|brick|терракот|рыж|rust|corten|кобре/i, '#a45c43'],
  [/олив|olive|зелён|зелен|green|мох/i, '#6f6b49'],
  [/синий|blue|индиго|indigo|сапфир|океан|небесн|голуб/i, '#3f4a63'],
  [/дуб|oak|rovere|дерев|wood|вуд|larix|teak|cedro|pino/i, '#b98f61'],
  [/бетон|beton|cemento|concrete|цемент|лофт|loft/i, '#a2a09b'],
  [/мрамор|marble|calacatta|statuario|карат|karat/i, '#e6e2d9'],
  [/ваниль|vanilla/i, '#e6d9bf'],
  [/квартит|шале/i, '#cfcabf'],
];

export function colorHex(name: string): string {
  for (const [re, hex] of MAP) if (re.test(name)) return hex;
  return '#cdc7bc';
}

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
