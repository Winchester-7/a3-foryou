/** @author Erbol king */
import { getSite } from '@/lib/site-server';
import { getCollections } from '@/lib/catalog';
import { CountUp, InViewLights } from '@/components/motion/InViewLights';
import { plural } from '@/lib/color';

/** The 2×2 window from the logo; pane `lit` (0–3) switches on when the section comes into view. */
function WindowIcon({ lit }: { lit: number }) {
  const panes = [
    [0, 0],
    [13, 0],
    [0, 13],
    [13, 13],
  ];
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden className="window-icon">
      {panes.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="11" height="11" rx="1.6" className={i === lit ? 'pane pane--on' : 'pane'} />
      ))}
    </svg>
  );
}

export function Advantages() {
  const site = getSite();
  const collections = getCollections();
  const decors = collections.reduce((n, c) => n + c.products.length, 0);
  const stockM2 = Math.round(collections.reduce((n, c) => n + (c.stockM2 ?? 0), 0));

  const stats = [
    { value: collections.length, label: plural(collections.length, 'коллекция', 'коллекции', 'коллекций') },
    { value: decors, label: plural(decors, 'декор', 'декора', 'декоров') },
    ...(stockM2 > 0 ? [{ value: stockM2, label: 'м² плитки на складе' }] : []),
  ];

  const items = [
    {
      title: 'Склад в Бишкеке',
      text: 'Всё из каталога есть на складе. Отгружаем в день заказа, доставляем по Бишкеку и по всей стране.',
    },
    {
      title: `Шоурум на ${site.street}`,
      text: `Крупные форматы на стендах и образцы поверхностей — можно потрогать и сравнить. ${site.hours}.`,
    },
    {
      title: 'Посчитаем и разложим',
      text: 'Назовите размеры помещения — рассчитаем плитку с запасом и подготовим раскладку. Для дизайнеров — спецификации.',
    },
    {
      title: 'Разные заводы и цены',
      text: 'IDALGO, GRANITEA, KERRANOVA, GRASARO и другие — от доступных серий до дизайнерских коллекций.',
    },
  ];

  return (
    <section className="border-y border-line bg-paper py-20 lg:py-28">
      <InViewLights className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 className="h-section max-w-xl text-balance">Почему у нас удобно</h2>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-[clamp(1.9rem,3.2vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-2 text-sm text-ink-faint">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={it.title} className="border-t-2 border-ink pt-5">
              <WindowIcon lit={i} />
              <h3 className="mt-4 text-base font-medium text-ink">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.text}</p>
            </div>
          ))}
        </div>
      </InViewLights>
    </section>
  );
}
