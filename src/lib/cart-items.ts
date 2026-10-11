/** @author Erbol king */
import type { Collection, Product } from './types';
import type { CartItem } from '@/components/cart/CartProvider';
import { brandName } from './catalog';

/** Cart payload for a keramogranit decor — keeps the article and sizes so the manager knows the exact SKU. */
export function tileCartItem(product: Product, collection?: Collection): Omit<CartItem, 'qty' | 'unit'> {
  const details = [
    collection && `${brandName(collection.brand)}, коллекция «${collection.nameRu}»`,
    product.article && `арт. ${product.article}`,
    product.sizes.length && `${product.sizes.join(', ')} мм`,
  ].filter(Boolean);
  return {
    id: `tile:${product.slug}`,
    kind: 'tile',
    title: product.nameRu,
    details: details.join(' · '),
    image: product.image,
    href: `/product/${product.slug}`,
  };
}
