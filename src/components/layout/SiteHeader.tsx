/** @author Erbol king */
import { collections, categories, allProducts, brandName } from '@/lib/catalog';
import { Header } from './Header';

export type SearchDoc = {
  href: string;
  title: string;
  subtitle: string;
  keywords: string;
};

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const index: SearchDoc[] = [
    ...collections.map((c) => ({
      href: `/collection/${c.slug}`,
      title: `${c.nameRu} · ${c.name}`,
      subtitle: `${brandName(c.brand)} · коллекция`,
      keywords: `${c.nameRu} ${c.name} ${c.tagline} ${brandName(c.brand)}`.toLowerCase(),
    })),
    ...allProducts.slice(0, 400).map((p) => ({
      href: `/product/${p.slug}`,
      title: p.nameRu,
      subtitle: p.name,
      keywords: `${p.nameRu} ${p.name} ${p.color} ${p.article ?? ''}`.toLowerCase(),
    })),
  ];

  const catalogMenu = categories.map((c) => ({
    slug: c.slug,
    title: c.menuTitle,
    tagline: c.tagline,
  }));

  return <Header overlay={overlay} index={index} catalogMenu={catalogMenu} />;
}
