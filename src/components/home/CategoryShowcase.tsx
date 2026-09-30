import Link from 'next/link';
import { categories, getCollection } from '@/lib/catalog';
import { TileImage } from '@/components/media/TileImage';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

export function CategoryShowcase() {
  return (
    <section className="container-x py-20 lg:py-28">
      <SectionHeading
        eyebrow="Каталог керамогранита"
        title="Девять направлений — одна система качества"
        text="Коллекции IDALGO, GRANITEA и «Уральский Гранит»: ректифицированные форматы, равномерный прокрас и износостойкие поверхности. Выберите фактуру — от тёплого дерева до архитектурного бетона."
        link={{ href: '/catalog', label: 'Весь каталог' }}
      />

      <StaggerGroup className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
        {categories.map((c) => {
          const hero = getCollection(c.heroCollection)?.hero ?? '/catalog/lusso/hero.jpg';
          return (
            <StaggerItem key={c.slug}>
              <Link href={`/catalog/${c.slug}`} className="group block">
                <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-surface">
                  <div className="absolute inset-0 transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
                    <TileImage src={hero} alt={c.title} sizes="(max-width: 768px) 50vw, 33vw" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
                  <div className="absolute inset-x-5 bottom-5">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                      {c.menuTitle}
                      <svg width="15" height="15" viewBox="0 0 16 16" className="translate-x-0 transition-transform duration-200 ease-out-strong group-hover:translate-x-1" aria-hidden>
                        <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-snug text-ink-faint">{c.tagline}</p>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
