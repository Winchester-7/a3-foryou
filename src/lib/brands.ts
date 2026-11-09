/**
 * Manufacturer names. Pure module — safe to import from client components.
 * @author Erbol king
 */
export const BRAND_NAMES: Record<string, string> = {
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

/**
 * Factories that are not sold through the site: their sheets are skipped by the Excel
 * import and anything already filed under them is not shown to visitors.
 */
export const HIDDEN_BRANDS: ReadonlySet<string> = new Set(['kazakhstan', 'china', 'tianshan', 'uzbekistan']);

export function brandName(b: string): string {
  return BRAND_NAMES[b] ?? b;
}

export function brandKeyFromName(name: string): string {
  return Object.entries(BRAND_NAMES).find(([, v]) => v === name)?.[0] ?? name;
}
