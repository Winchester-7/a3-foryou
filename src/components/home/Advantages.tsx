/** @author Erbol king */
import { getSite } from '@/lib/site-server';

export function Advantages() {
  const site = getSite();
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
      <div className="container-x">
        <h2 className="h-section max-w-2xl text-balance">Почему у нас удобно</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="border-t-2 border-ink pt-5">
              <h3 className="text-base font-medium text-ink">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
