import Link from 'next/link';
import { interiorCategories } from '@/lib/interior';
import { Photo } from '@/components/media/Photo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

export function InteriorTeaser() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Интерьер и мебель"
          title="Не только плитка — цельный интерьер"
          text="Диваны, двери, раковины, смесители и мебель для ванной, подобранные под палитру и фактуру наших коллекций керамогранита."
          link={{ href: '/interior', label: 'Открыть раздел' }}
        />

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {interiorCategories.map((c) => (
            <StaggerItem key={c.slug}>
              <Link href={`/interior/${c.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface2">
                  <div className="h-full w-full transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
                    <Photo
                      seed={c.bannerSeed}
                      width={480}
                      height={480}
                      alt={c.title}
                      sizes="(max-width: 768px) 45vw, 18vw"
                      grayscale
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-ink transition-colors group-hover:text-accent">
                  {c.menuTitle}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
