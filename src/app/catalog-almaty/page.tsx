import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryBanner } from '@/components/catalog/CategoryBanner';
import { CatalogView } from '@/components/catalog/CatalogView';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';
import { collections, buildFacets, allProducts } from '@/lib/catalog';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Каталог Алматы',
  description:
    'Керамогранит IDALGO, GRANITEA и «Уральский Гранит» для Алматы и Казахстана. Тот же ассортимент, доставка из Бишкека, консультация и расчёт по запросу.',
  alternates: { canonical: '/catalog-almaty' },
};

export default function CatalogAlmatyPage() {
  const facets = buildFacets(collections);

  return (
    <PageShell>
      <CategoryBanner
        eyebrow="A3 FOR YOU · Алматы"
        title="Каталог для Алматы"
        text={`${collections.length} коллекций и ${allProducts.length} декоров керамогранита с доставкой в Алматы и по Казахстану. Ассортимент, цены и сроки уточняйте у менеджера — работаем с оптовыми и проектными поставками.`}
        src="/catalog/karatash/hero.jpg"
        stats={[
          { value: 'Алматы', label: 'доставка' },
          { value: '3', label: 'бренда' },
          { value: 'по запросу', label: 'цена и сроки' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Каталог Алматы' }]} flush />

      <section className="container-x pt-10">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-ink-soft">
            Отгрузка в Алматы формируется под заказ. Оставьте заявку — рассчитаем стоимость с доставкой,
            подготовим спецификацию и проверим наличие на складе.
          </p>
          <div className="flex shrink-0 gap-3">
            <CallbackTrigger kind="request" subject="Заявка из каталога Алматы" label="Запросить условия" className="btn-accent" />
            <a href={site.whatsapp} target="_blank" rel="noreferrer noopener" className="btn-outline">
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <CatalogView collections={collections} facets={facets} />
    </PageShell>
  );
}
