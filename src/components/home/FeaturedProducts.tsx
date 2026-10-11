/** @author Erbol king */
import type { Collection } from '@/lib/types';
import { CollectionCard } from '@/components/catalog/CollectionCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

export function FeaturedProducts({ collections }: { collections: Collection[] }) {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Избранное"
          title="Коллекции, которые выбирают"
          text="Самые крупные коллекции, которые есть у нас на складе: мрамор, камень, дерево и бетон."
          link={{ href: '/catalog', label: 'Смотреть все' }}
        />
        <StaggerGroup className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {collections.map((c) => (
            <StaggerItem key={c.slug}>
              <CollectionCard collection={c} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
