'use client';

/**
 * Language switcher (RU / KY). The pages are rendered in Russian; when the
 * visitor picks Kyrgyz, text nodes and a few attributes are translated in
 * place and kept in sync with later DOM updates by a MutationObserver.
 * @author Erbol king
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translateToKy } from '@/lib/i18n/translate';
import { site } from '@/lib/site';

export type Locale = 'ru' | 'ky';

const STORAGE_KEY = 'a3-lang';
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'] as const;
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CODE', 'PRE']);

const Ctx = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({ locale: 'ru', setLocale: () => {} });
export const useLocale = () => useContext(Ctx);

type TextState = { original: string; translated: string };
type AttrState = Record<string, TextState>;

function plannerOrigin(): string {
  try {
    return new URL(site.plannerUrl).origin;
  } catch {
    return '';
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ru');

  useEffect(() => {
    try {
      const fromQuery = new URLSearchParams(location.search).get('lang');
      const saved = fromQuery ?? localStorage.getItem(STORAGE_KEY);
      if (saved === 'ky' || saved === 'ru') setLocaleState(saved);
    } catch {
      /* storage unavailable — stay Russian */
    }
  }, []);

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
    const attrs = new Map<Element, AttrState>();
    const origin = plannerOrigin();

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
      if (origin && el instanceof HTMLAnchorElement && el.href.startsWith(origin) && !el.href.includes('lang=')) {
        el.setAttribute('data-ru-href', el.getAttribute('href') ?? '');
        el.href = `${el.href}${el.href.includes('?') ? '&' : '?'}lang=ky`;
      }
    };

    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        doText(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      if (SKIP.has(el.tagName)) return;
      doAttrs(el);
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) =>
          n.nodeType === Node.ELEMENT_NODE && SKIP.has((n as Element).tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
      });
      let n: Node | null = tw.nextNode();
      while (n) {
        if (n.nodeType === Node.TEXT_NODE) doText(n as Text);
        else doAttrs(n as Element);
        n = tw.nextNode();
      }
    };

    const translateTitle = () => {
      const t = document.querySelector('title');
      if (t?.firstChild) doText(t.firstChild as Text);
    };

    walk(document.body);
    translateTitle();

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') doText(r.target as Text);
        else if (r.type === 'attributes') doAttrs(r.target as Element);
        else r.addedNodes.forEach((n) => walk(n));
      }
      translateTitle();
    });
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });

    return () => {
      mo.disconnect();
      texts.forEach((st, node) => {
        if (node.isConnected && node.nodeValue === st.translated) node.nodeValue = st.original;
      });
      attrs.forEach((rec, el) => {
        for (const [a, st] of Object.entries(rec)) {
          if (el.getAttribute(a) === st.translated) el.setAttribute(a, st.original);
        }
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
