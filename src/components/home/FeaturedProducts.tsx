/** @author Erbol king */
import type { Collection } from '@/lib/types';
import { CollectionCard } from '@/components/catalog/CollectionCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function FeaturedProducts({ collections }: { collections: Collection[] }) {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          title="Больше всего на складе"
          text="Этих коллекций у нас больше всего — удобно, когда плитки нужно много и сразу."
          link={{ href: '/catalog', label: 'Весь каталог' }}
        />
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.slug} collection={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
