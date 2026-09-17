import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Где купить',
  description:
    'Шоурум и склад A3 FOR YOU в Бишкеке. Керамогранит IDALGO, GRANITEA и «Уральский Гранит» с доставкой по Кыргызстану.',
  alternates: { canonical: '/where-to-buy' },
};

const points = [
  {
    city: 'Бишкек',
    name: 'Шоурум и склад A3 FOR YOU',
    address: site.address,
    phone: site.phone,
    hours: site.hours,
    note: 'Экспозиция коллекций, библиотека поверхностей, консультация дизайнера, самовывоз',
  },
  {
    city: 'Бишкек',
    name: 'Отдел для дизайнеров и архитекторов',
    address: 'г. Бишкек, по предварительной записи',
    phone: site.phone,
    hours: 'Пн–Сб 10:00 – 18:00',
    note: 'Образцы для проектов, спецификации, расчёт и раскладка',
  },
  {
    city: 'Кыргызстан',
    name: 'Доставка по регионам',
    address: 'Ош, Джалал-Абад, Каракол, Талас, Нарын и другие города',
    phone: site.phoneHref,
    hours: 'Приём заявок ежедневно',
    note: 'Отправка транспортными компаниями, расчёт стоимости по запросу',
  },
];

export default function WhereToBuyPage() {
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Где купить' }]} />
      <PageHeader
        title="Где купить"
        text="Шоурум и склад в Бишкеке, отдел для архитекторов и дизайнеров, доставка по всей Кыргызской Республике. Онлайн-заявка — в любое время."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={`tel:${site.phoneHref}`} className="btn-solid">
            {site.phone}
          </a>
          <a href={site.whatsapp} target="_blank" rel="noreferrer noopener" className="btn-accent">
            Написать в WhatsApp
          </a>
          <CallbackTrigger label="Заказать звонок" className="btn-outline" />
        </div>
      </PageHeader>

      <section className="container-x pb-20">
        <StaggerGroup className="grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {points.map((p) => (
            <StaggerItem key={p.name}>
              <article className="flex h-full flex-col rounded-2xl border border-line p-6 transition-colors hover:border-accent">
                <p className="text-[11px] uppercase tracking-wide2 text-accent">{p.city}</p>
                <h2 className="mt-2 text-lg font-medium text-ink">{p.name}</h2>
                <p className="mt-3 text-sm text-ink-soft">{p.address}</p>
                <p className="mt-1 text-sm text-ink-soft">{p.hours}</p>
                <p className="mt-3 text-xs text-ink-faint">{p.note}</p>
                <a href={`tel:${site.phoneHref}`} className="mt-4 text-sm font-medium text-ink">
                  {site.phone}
                </a>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 overflow-hidden rounded-3xl border border-line">
          <iframe
            title="Карта — Бишкек"
            src="https://www.openstreetmap.org/export/embed.html?bbox=74.54%2C42.83%2C74.66%2C42.90&layer=mapnik"
            className="h-[380px] w-full grayscale"
            loading="lazy"
          />
        </div>
      </section>
    </PageShell>
  );
}
