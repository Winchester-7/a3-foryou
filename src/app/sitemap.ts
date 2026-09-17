import type { MetadataRoute } from 'next';
import { categories, collections, allProducts } from '@/lib/catalog';
import { interiorCategories } from '@/lib/interior';
import { news } from '@/lib/editorial';
import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
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
    s('/interior', 0.8),
    s('/where-to-buy', 0.8),
    s('/about', 0.7),
    s('/news', 0.7),
    s('/promotions', 0.7),
    ...categories.map((c) => s(`/catalog/${c.slug}`, 0.8)),
    ...collections.map((c) => s(`/collection/${c.slug}`, 0.7, 'monthly')),
    ...allProducts.map((p) => s(`/product/${p.slug}`, 0.6, 'monthly')),
    ...interiorCategories.map((c) => s(`/interior/${c.slug}`, 0.5, 'monthly')),
    ...news.map((n) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: new Date(n.date),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
  ];
}
