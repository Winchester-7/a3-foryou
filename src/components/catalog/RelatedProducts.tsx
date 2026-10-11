/** @author Erbol king */
import { ProductGrid, type GridItem } from './ProductGrid';

export function RelatedProducts({ items, title = 'Смотрите также' }: { items: GridItem[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="border-t border-line bg-surface py-16 lg:py-24">
      <div className="container-x">
        <h2 className="h-section">{title}</h2>
        <div className="mt-10">
          <ProductGrid items={items} />
        </div>
      </div>
    </section>
  );
}
