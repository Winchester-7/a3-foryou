/** @author Erbol king */
import { getCollections, getAllProducts, getCategories, getCollectionByProduct, getLook, brandName } from '@/lib/catalog';
import { getDoors, doorKindLabel } from '@/lib/doors';
import { getSofas } from '@/lib/sofas';
import { site } from '@/lib/site';
import { toWords, type SearchDoc } from '@/lib/search';
import { Header } from './Header';

export type { SearchDoc };

const doc = (d: Omit<SearchDoc, 'words' | 'titleWords'>, ...extra: (string | undefined)[]): SearchDoc => ({
  ...d,
  titleWords: toWords(d.title),
  words: toWords(d.title, d.subtitle, ...extra),
});

/** Everything a visitor might type: sections, collections, every decor, doors, sofas and the main pages. */
function buildIndex(): SearchDoc[] {
  const out: SearchDoc[] = [];

  for (const c of getCategories()) {
    out.push(doc({ href: `/catalog/${c.slug}`, title: c.title, subtitle: c.tagline, kind: 'category' }, c.menuTitle, c.description));
  }

  for (const c of getCollections()) {
    const look = getLook(c.look);
    out.push(
      doc(
        { href: `/collection/${c.slug}`, title: c.nameRu, subtitle: `${brandName(c.brand)} · ${look?.short?.toLowerCase() ?? 'коллекция'}`, kind: 'collection', image: c.hero },
        c.name,
        c.tagline,
        brandName(c.brand),
        look?.title,
        c.sizes.join(' '),
        c.surfaces.join(' '),
        c.applications.join(' '),
        'коллекция керамогранит плитка',
      ),
    );
  }

  for (const p of getAllProducts()) {
    const c = getCollectionByProduct(p.slug);
    out.push(
      doc(
        {
          href: `/product/${p.slug}`,
          title: p.nameRu,
          subtitle: [c ? brandName(c.brand) : '', p.sizes.join(', '), p.article ? `арт. ${p.article}` : ''].filter(Boolean).join(' · '),
          kind: 'product',
          image: p.image,
        },
        p.name,
        p.color,
        p.article,
        c?.nameRu,
        c?.name,
        c ? getLook(c.look)?.title : undefined,
        p.surfaces.join(' '),
        'керамогранит плитка декор',
      ),
    );
  }

  for (const d of getDoors()) {
    out.push(
      doc(
        { href: `/doors/${d.slug}`, title: `Дверь ${d.name}`, subtitle: `${doorKindLabel(d)} · ${d.style}`, kind: 'door', image: d.image },
        d.brand,
        d.colors.map((x) => x.name).join(' '),
        d.types.includes('ДО') ? 'со стеклом остекленная' : 'глухая',
        'двери межкомнатные входные',
      ),
    );
  }

  for (const s of getSofas()) {
    out.push(
      doc(
        { href: `/sofas/${s.slug}`, title: `${s.kind} ${s.name}`, subtitle: `${s.brand} · ${s.sizes.join(', ')} см`, kind: 'sofa', image: s.image },
        s.fabrics.map((f) => f.name).join(' '),
        'диваны кресла мягкая мебель',
      ),
    );
  }

  const pages: [string, string, string, string][] = [
    ['/catalog', 'Весь каталог', 'Керамогранит со склада в Бишкеке', 'каталог керамогранит плитка'],
    ['/doors', 'Двери', 'Межкомнатные и входные двери', 'двери'],
    ['/sofas', 'Диваны', 'Диваны и кресла для интерьера', 'диваны кресла'],
    ['/where-to-buy', 'Где купить', `${site.address} · шоурум и склад`, 'адрес контакты телефон шоурум склад доставка карта'],
    ['/promotions', 'Акции', 'Скидки и специальные предложения', 'акции скидки распродажа'],
    ['/portfolio', 'Портфолио', 'Коллекции в готовых интерьерах', 'портфолио интерьеры фото'],
    ['/about', 'О продукции', 'Что такое керамогранит и как его выбрать', 'о продукции керамогранит характеристики'],
    [site.plannerUrl, 'Интерьер в 3D', '3D-планировщик: ваша комната с нашей плиткой', '3d планировщик интерьер конструктор'],
  ];
  for (const [href, title, subtitle, extra] of pages) out.push(doc({ href, title, subtitle, kind: 'page' }, extra));

  return out;
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return <Header overlay={overlay} index={buildIndex()} />;
}
