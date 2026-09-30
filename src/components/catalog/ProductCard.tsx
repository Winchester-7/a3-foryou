'use client';

import Link from 'next/link';
import type { Collection, Product } from '@/lib/types';
import { TileImage } from '@/components/media/TileImage';
import { QuickAdd } from '@/components/cart/AddToCart';
import { tileCartItem } from '@/lib/cart-items';

export function ProductCard({
  product,
  brand,
  collection,
  onQuickView,
  priority = false,
}: {
  product: Product;
  brand?: string;
  collection?: Collection;
  onQuickView?: (slug: string) => void;
  priority?: boolean;
}) {
  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
          {/* slow, decorative zoom — hover only, never on touch */}
          <div className="absolute inset-0 transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
            <TileImage src={product.image} alt={product.nameRu} priority={priority} />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />

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
              className="absolute inset-x-4 bottom-4 hidden rounded-full bg-paper/95 py-3 text-[11px] font-semibold uppercase tracking-wide2 text-ink opacity-0 backdrop-blur transition-[opacity,transform,background-color] duration-200 ease-out-strong [transform:translateY(8px)] hover:bg-paper active:scale-[0.97] group-hover:opacity-100 group-hover:[transform:translateY(0)] [@media(hover:hover)]:block"
            >
              Быстрый просмотр
            </button>
          )}
        </div>
      </Link>

      <QuickAdd item={tileCartItem(product, collection)} className="absolute right-3 top-3" />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-[15px] font-medium leading-snug text-ink transition-colors duration-200 group-hover:text-accent">
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
