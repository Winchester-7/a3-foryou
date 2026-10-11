'use client';

/** @author Erbol king */

import { useLeadDialog } from '@/components/forms/LeadDialog';
import { AddToCart } from '@/components/cart/AddToCart';
import type { CartItem } from '@/components/cart/CartProvider';

export function ProductActions({ productName, cartItem }: { productName: string; cartItem: Omit<CartItem, 'qty' | 'unit'> }) {
  const { open } = useLeadDialog();

  return (
    <div className="mt-8 space-y-3">
      <AddToCart item={cartItem} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => open('consult', productName)} className="btn-outline flex-1">
          Запросить консультацию
        </button>
        <a href="/catalog-a3-foryou.pdf" download className="btn-outline flex-1">
          Скачать каталог PDF
        </a>
      </div>
    </div>
  );
}
