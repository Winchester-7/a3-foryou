/** Tile layout options — kept free of three.js so the UI shell can import them cheaply. */
export type Layout = 'straight' | 'offset' | 'vertical';
export type Grout = 'light' | 'mid' | 'dark';

export const GROUT_COLORS: Record<Grout, string> = { light: '#ebe7e0', mid: '#9d9992', dark: '#3a3936' };
export const GROUT_LABELS: Record<Grout, string> = { light: 'Светлая', mid: 'Серая', dark: 'Тёмная' };
export const LAYOUT_LABELS: Record<Layout, string> = { straight: 'Прямая', offset: 'Вразбежку', vertical: 'Вертикально' };
