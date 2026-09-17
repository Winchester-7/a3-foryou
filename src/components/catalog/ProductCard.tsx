'use client';

import Link from 'next/link';
import type { Product } from '@/lib/types';
import { TileImage } from '@/components/media/TileImage';

export function ProductCard({
  product,
  brand,
  onQuickView,
  priority = false,
}: {
  product: Product;
  brand?: string;
  onQuickView?: (slug: string) => void;
  priority?: boolean;
}) {
  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-premium group-hover:scale-[1.07]">
            <TileImage src={product.image} alt={product.nameRu} priority={priority} />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {product.article && (
            <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide2 text-ink">
              {product.article}
            </span>
          )}

          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product.slug);
              }}
              className="pointer-events-auto absolute inset-x-4 bottom-4 translate-y-3 rounded-full bg-paper/95 py-3 text-[11px] font-semibold uppercase tracking-wide2 text-ink opacity-0 backdrop-blur transition-all duration-500 ease-premium group-hover:translate-y-0 group-hover:opacity-100 hover:bg-paper"
            >
              Быстрый просмотр
            </button>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
              {product.nameRu}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-ink-faint">
            {product.sizes.join(' · ')} см{brand ? ` · ${brand}` : ''}
          </p>
        </div>
      </div>
    </article>
  );
}
