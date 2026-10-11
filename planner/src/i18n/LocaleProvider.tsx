import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SITE_URL } from '../data/catalog';
import { translateToKy } from './translate';

/**
 * RU / KY switcher for the planner. Same approach as on the shop site: the UI is
 * written in Russian and translated in place, with a MutationObserver keeping
 * later React updates in sync. The language arrives from the site as ?lang=ky.
 * @author Erbol king
 */
export type Locale = 'ru' | 'ky';

const STORAGE_KEY = 'a3-lang';
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'] as const;
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CANVAS']);

const Ctx = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({ locale: 'ru', setLocale: () => {} });
export const useLocale = () => useContext(Ctx);

type TextState = { original: string; translated: string };

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      const saved = q ?? localStorage.getItem(STORAGE_KEY);
      return saved === 'ky' ? 'ky' : 'ru';
    } catch {
      return 'ru';
    }
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale === 'ky' ? 'ky' : 'ru';
    if (locale === 'ru') return;

    const texts = new Map<Text, TextState>();
    const attrs = new Map<Element, Record<string, TextState>>();
    let siteOrigin = '';
    try {
      siteOrigin = new URL(SITE_URL).origin;
    } catch {
      /* ignore */
    }

    const doText = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || SKIP.has(parent.tagName) || parent.closest('[translate="no"]')) return;
      const cur = node.nodeValue ?? '';
      const st = texts.get(node);
      if (st && st.translated === cur) return;
      const translated = translateToKy(cur);
      if (translated !== cur) {
        texts.set(node, { original: cur, translated });
        node.nodeValue = translated;
      }
    };

    const doAttrs = (el: Element) => {
      if (SKIP.has(el.tagName) || el.closest('[translate="no"]')) return;
      for (const a of ATTRS) {
        const cur = el.getAttribute(a);
        if (!cur) continue;
        const st = attrs.get(el)?.[a];
        if (st && st.translated === cur) continue;
        const translated = translateToKy(cur);
        if (translated !== cur) {
          const rec = attrs.get(el) ?? {};
          rec[a] = { original: cur, translated };
          attrs.set(el, rec);
          el.setAttribute(a, translated);
        }
      }
      if (siteOrigin && el instanceof HTMLAnchorElement && el.href.startsWith(siteOrigin) && !el.href.includes('lang=')) {
        el.setAttribute('data-ru-href', el.getAttribute('href') ?? '');
        el.href = `${el.href}${el.href.includes('?') ? '&' : '?'}lang=ky`;
      }
    };

    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return doText(root as Text);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      if (SKIP.has(el.tagName)) return;
      doAttrs(el);
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) =>
          n.nodeType === Node.ELEMENT_NODE && SKIP.has((n as Element).tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
      });
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) doText(n as Text);
        else doAttrs(n as Element);
      }
    };

    walk(document.body);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') doText(r.target as Text);
        else if (r.type === 'attributes') doAttrs(r.target as Element);
        else r.addedNodes.forEach((n) => walk(n));
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });

    return () => {
      mo.disconnect();
      texts.forEach((st, node) => {
        if (node.isConnected && node.nodeValue === st.translated) node.nodeValue = st.original;
      });
      attrs.forEach((rec, el) => {
        for (const [a, st] of Object.entries(rec)) if (el.getAttribute(a) === st.translated) el.setAttribute(a, st.original);
      });
      document.querySelectorAll('a[data-ru-href]').forEach((a) => {
        a.setAttribute('href', a.getAttribute('data-ru-href') ?? '');
        a.removeAttribute('data-ru-href');
      });
    };
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** RU / KY pill used in both planner headers. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div translate="no" role="group" aria-label="Language" className={`inline-flex items-center rounded-full border border-line p-0.5 text-[11px] font-semibold tracking-wide2 text-ink ${className}`}>
      {(
        [
          ['ru', 'РУС'],
          ['ky', 'КЫР'],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={locale === id}
          onClick={() => setLocale(id)}
          className={`rounded-full px-2.5 py-1 transition-colors duration-150 ${locale === id ? 'bg-ink text-paper' : 'opacity-70 hover:opacity-100'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
