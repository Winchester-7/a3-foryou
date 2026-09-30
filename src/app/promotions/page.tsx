import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Photo } from '@/components/media/Photo';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { promotions, formatDate } from '@/lib/editorial';

export const metadata: Metadata = {
  title: 'Акции',
  description: 'Актуальные акции и специальные предложения A3 FOR YOU: скидки на коллекции керамогранита, комплекты и доставку.',
  alternates: { canonical: '/promotions' },
};

export default function PromotionsPage() {
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Акции' }]} />
      <PageHeader title="Акции" text="Сезонные скидки, комплектные предложения и бонусы для проектов. Условия уточняйте у менеджера." />

      <section className="container-x pb-20">
        <StaggerGroup className="grid gap-6 md:grid-cols-2">
          {promotions.map((p) => (
            <StaggerItem key={p.slug}>
              <article
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border ${
                  p.accent ? 'border-accent/40' : 'border-line'
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                  <div className="h-full w-full transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
                    <Photo seed={p.imageSeed} width={900} height={506} alt={p.title} sizes="(max-width: 768px) 90vw, 45vw" grayscale className="h-full w-full object-cover" />
                  </div>
                  <span
                    className={`absolute left-5 top-5 rounded-full px-4 py-1.5 text-sm font-semibold ${
                      p.accent ? 'bg-accent text-paper' : 'bg-paper text-ink'
                    }`}
                  >
                    {p.offer}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-medium text-ink">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.description}</p>
                  <p className="mt-4 text-xs uppercase tracking-wide2 text-ink-faint">
                    Действует до {formatDate(p.until)}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-14 flex flex-col items-start gap-5 rounded-3xl bg-ink p-8 text-paper sm:flex-row sm:items-center sm:justify-between lg:p-12">
          <div>
            <h2 className="text-2xl font-semibold">Не нашли подходящее предложение?</h2>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Оставьте заявку — менеджер подберёт индивидуальные условия под объём вашего проекта.
            </p>
          </div>
          <CallbackTrigger
            kind="request"
            label="Оставить заявку"
            className="btn bg-paper text-ink hover:bg-white"
          />
        </div>
      </section>
    </PageShell>
  );
}
