/** @author Erbol king */
import { SITE_URL } from '../data/catalog';
import { LogoMark } from './LogoMark';

/** Same mark as the main site; always links back to it. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href={SITE_URL} aria-label="A3 FOR YOU — на главную сайта" className="logo-link inline-flex items-end gap-2">
      <LogoMark height={compact ? 28 : 34} />
      {!compact && <span className="mb-[3px] text-[8.5px] font-semibold uppercase leading-none tracking-brand text-ink-faint">For&nbsp;You</span>}
    </a>
  );
}
