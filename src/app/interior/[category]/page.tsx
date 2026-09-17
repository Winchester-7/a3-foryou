import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { Photo } from '@/components/media/Photo';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { interiorCategories, getInteriorCategory } from '@/lib/interior';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return interiorCategories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const c = getInteriorCategory(params.category);
  if (!c) return {};
  return {
    title: `${c.title} — Интерьер и мебель`,
    description: c.description,
    alternates: { canonical: `/interior/${c.slug}` },
    openGraph: { title: `${c.title} — ${site.name}`, description: c.tagline },
  };
}

export default function InteriorCategoryPage({ params }: { params: { category: string } }) {
  const cat = getInteriorCategory(params.category);
  if (!cat) notFound();

  return (
    <PageShell>
      <CategoryBanner
        eyebrow="Интерьер и мебель"
        title={cat.title}
        text={cat.description}
        seed={cat.bannerSeed}
      />
      {/* interior category imagery uses placeholder photography — see README */}
      <Breadcrumbs
        items={[{ label: 'Интерьер и мебель', href: '/interior' }, { label: cat.menuTitle }]}
        flush
      />

      <section className="container-x py-12 lg:py-16">
        <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
          {cat.items.map((item) => (
            <StaggerItem key={item.slug}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
                  <div className="h-full w-full transition-transform duration-700 ease-premium group-hover:scale-[1.06]">
                    <Photo
                      seed={item.imageSeed}
                      width={560}
                      height={700}
                      alt={item.name}
                      sizes="(max-width: 768px) 45vw, 30vw"
                      grayscale
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wide2 text-ink-faint">{item.brand}</p>
                  <h3 className="mt-1 text-[15px] font-medium text-ink">{item.name}</h3>
                  <p className="mt-1 text-xs text-ink-faint">{item.material}</p>
                  <p className="mt-2 text-xs text-ink-soft">{item.note}</p>
                  <p className="mt-2 text-sm font-medium text-ink">Цена по запросу</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="border-t border-line bg-surface py-16">
        <div className="container-x flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="h-section">Нужна помощь с подбором?</h2>
            <p className="mt-3 max-w-md text-sm text-ink-soft">
              Соберём комплект мебели и сантехники под выбранную коллекцию керамогранита.
            </p>
          </div>
          <CallbackTrigger kind="consult" label="Запросить консультацию" className="btn-solid" />
        </div>
      </section>
    </PageShell>
  );
}
