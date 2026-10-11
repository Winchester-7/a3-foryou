'use client';

/** @author Erbol king */

import { useLocale, type Locale } from './LocaleProvider';

const OPTIONS: { id: Locale; label: string; full: string }[] = [
  { id: 'ru', label: 'РУС', full: 'Русский' },
  { id: 'ky', label: 'КЫР', full: 'Кыргызча' },
];

/** RU / KY toggle. `tone` follows the header: light text over the hero, dark when solid. */
export function LanguageSwitch({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      translate="no"
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border p-0.5 text-[11px] font-semibold tracking-wide2 ${
        tone === 'light' ? 'border-white/40 text-white' : 'border-line text-ink'
      } ${className}`}
    >
      {OPTIONS.map((o) => {
        const active = locale === o.id;
        return (
          <button
            key={o.id}
            type="button"
            title={o.full}
            aria-pressed={active}
            onClick={() => setLocale(o.id)}
            className={`rounded-full px-2.5 py-1 transition-colors duration-150 ${
              active ? (tone === 'light' ? 'bg-white text-ink' : 'bg-ink text-paper') : 'opacity-70 hover:opacity-100'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
