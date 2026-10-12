/** @author Erbol king */
import type { MetadataRoute } from 'next';
import { getCategories, getCollections, getAllProducts } from '@/lib/catalog';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = getCategories();
  const collections = getCollections();
  const allProducts = getAllProducts();
  const now = new Date();
  const base = site.url;

  const s = (path: string, p = 0.7, f: 'weekly' | 'monthly' | 'yearly' = 'weekly') => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: f,
    priority: p,
  });

  return [
    s('', 1),
    s('/catalog', 0.9),
    s('/doors', 0.8),
    s('/sofas', 0.8),
    s('/where-to-buy', 0.8),
    s('/about', 0.7),
    s('/portfolio', 0.7),
    s('/promotions', 0.7),
    ...categories.map((c) => s(`/catalog/${c.slug}`, 0.8)),
    ...collections.map((c) => s(`/collection/${c.slug}`, 0.7, 'monthly')),
    ...allProducts.map((p) => s(`/product/${p.slug}`, 0.6, 'monthly')),
  ];
}
