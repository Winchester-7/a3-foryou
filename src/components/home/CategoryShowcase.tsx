/** @author Erbol king */
import { DirectionGrid } from '@/components/catalog/DirectionGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function CategoryShowcase() {
  return (
    <section className="container-x py-20 lg:py-28">
      <SectionHeading
        title="С чего начать выбор"
        text="Выберите фактуру или назначение — покажем всё, что есть на нашем складе в Бишкеке."
        link={{ href: '/catalog', label: 'Весь керамогранит' }}
      />
      <div className="mt-14">
        <DirectionGrid />
      </div>
    </section>
  );
}
