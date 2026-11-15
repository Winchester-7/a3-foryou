'use client';

/** @author Erbol king */

import { useMemo, useState } from 'react';
import type { Collection, Product } from '@/lib/types';
import { brandName } from '@/lib/brands';
import { ProductCard } from './ProductCard';
import { QuickView } from './QuickView';

export type GridItem = { product: Product; collection: Collection };

export function ProductGrid({
  items,
  columns = 4,
}: {
  items: GridItem[];
  columns?: 3 | 4;
  /** kept for callers; every card now lands on its own */
  stagger?: boolean;
}) {
  const [quick, setQuick] = useState<GridItem | null>(null);
  const bySlug = useMemo(() => new Map(items.map((it) => [it.product.slug, it])), [items]);
  const cols = columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  const cards = items.map((it, i) => (
    <ProductCard
      key={it.product.slug}
      product={it.product}
      brand={brandName(it.collection.brand)}
      collection={it.collection}
      onQuickView={(slug) => setQuick(bySlug.get(slug) ?? null)}
      priority={i < 3}
    />
  ));

  return (
    <>
      {/* each ProductCard lands on its own (TileIn), so no extra stagger wrapper here */}
      <div className={`grid grid-cols-2 gap-x-5 gap-y-10 ${cols}`}>{cards}</div>
      <QuickView data={quick} onClose={() => setQuick(null)} />
    </>
  );
}
