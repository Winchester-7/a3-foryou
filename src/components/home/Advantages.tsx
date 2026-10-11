/** @author Erbol king */
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

const ITEMS = [
  {
    n: '01',
    title: 'Три завода, один поставщик',
    text: 'Официальный представитель ГК «Уральский Гранит» в Кыргызстане: бренды IDALGO, GRANITEA и «Уральский Гранит» — без наценки посредников.',
  },
  {
    n: '02',
    title: 'Склад в Бишкеке',
    text: 'Популярные коллекции в наличии на складе в Бишкеке. Отгрузка в день заказа, доставка по городу и по всей стране.',
  },
  {
    n: '03',
    title: 'Поддержка проекта',
    text: 'Раскладка, расчёт материала, спецификации и авторский надзор на объекте для архитекторов и дизайнеров.',
  },
  {
    n: '04',
    title: 'Тактильный шоурум',
    text: 'Экспозиция в Бишкеке: большие форматы на стендах, библиотека поверхностей, консультации с дизайнером.',
  },
];

export function Advantages() {
  return (
    <section className="border-y border-line bg-paper py-20 lg:py-28">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Почему A3 FOR YOU</p>
          <h2 className="h-section mt-3 max-w-2xl text-balance">
            Сервис уровня европейского бренда отделочных материалов
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => (
            <StaggerItem key={it.n}>
              <div className="border-t-2 border-ink pt-5">
                <span className="text-xs font-semibold tracking-wide2 text-accent">{it.n}</span>
                <h3 className="mt-3 text-base font-medium text-ink">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
