import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { Photo } from '@/components/media/Photo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { interiorCategories } from '@/lib/interior';

export const metadata: Metadata = {
  title: 'Интерьер и мебель',
  description:
    'Диваны, двери, раковины, смесители и мебель для ванной, подобранные под коллекции керамогранита A3 FOR YOU.',
  alternates: { canonical: '/interior' },
};

export default function InteriorIndexPage() {
  return (
    <PageShell>
      <CategoryBanner
        eyebrow="Интерьер и мебель"
        title="Цельный интерьер, а не только плитка"
        text="Мы подбираем мебель и сантехнику в одной палитре с керамогранитом — чтобы проект собирался из совместимых элементов, а не из случайных находок."
        seed="a3-interior-hero"
      />
      <Breadcrumbs items={[{ label: 'Интерьер и мебель' }]} flush />

      <section className="container-x py-14 lg:py-20">
        <SectionHeading eyebrow="Категории" title="Пять направлений" />
        <StaggerGroup className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {interiorCategories.map((c) => (
            <StaggerItem key={c.slug}>
              <Link href={`/interior/${c.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                  <div className="h-full w-full transition-transform duration-700 ease-premium group-hover:scale-105">
                    <Photo
                      seed={c.bannerSeed}
                      width={720}
                      height={540}
                      alt={c.title}
                      sizes="(max-width: 768px) 90vw, 30vw"
                      grayscale
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-ink transition-colors group-hover:text-accent">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.tagline}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </PageShell>
  );
}
