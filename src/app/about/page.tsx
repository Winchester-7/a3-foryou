import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { TECH_SPECS, CARE_STEPS } from '@/lib/specs';

export const metadata: Metadata = {
  title: 'О продукции',
  description:
    'Керамогранит IDALGO, GRANITEA и «Уральский Гранит»: технология производства, технические характеристики по ГОСТ 13996-2019, области применения и уход.',
  alternates: { canonical: '/about' },
};

const steps = [
  ['01', 'Сырьё', 'Каолиновые глины, полевой шпат и кварц. Контроль партий по химическому составу и белизне.'],
  ['02', 'Прессование', 'Гидравлические прессы формуют плиты крупного формата с высокой плотностью массы.'],
  ['03', 'Цифровая печать HD', 'Многослойная печать воспроизводит рисунок мрамора, камня и дерева с реалистичной глубиной.'],
  ['04', 'Обжиг', 'Температура 1200–1250 °C, полное спекание массы. Водопоглощение снижается до сотых долей процента.'],
  ['05', 'Ректификация', 'Калибровка кромок обеспечивает шов от 1,5 мм и идеальную геометрию раскладки.'],
  ['06', 'Контроль качества', 'Сортировка по калибру и тону, проверка плоскостности и поверхностных дефектов.'],
];

export default function AboutPage() {
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'О продукции' }]} />
      <PageHeader
        title="О продукции"
        text="Керамогранит — спечённая при высокой температуре смесь глин, полевого шпата и кварца: материал без пор, стойкий к влаге, истиранию, ультрафиолету и морозу. Мы работаем напрямую с ГК «Уральский Гранит» и предлагаем три бренда — IDALGO, GRANITEA и «Уральский Гранит»."
      />

      <section className="container-x">
        <Reveal>
          <ParallaxImage src="/catalog/karatash/hero.jpg" alt="Керамогранит в интерьере" className="aspect-[21/9] rounded-3xl" strength={40} />
        </Reveal>
      </section>

      <section className="container-x py-20">
        <Reveal>
          <p className="eyebrow">Технические характеристики</p>
          <h2 className="h-section mt-3 max-w-2xl">Соответствие ГОСТ 13996-2019, класс BIa</h2>
        </Reveal>
        <StaggerGroup className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_SPECS.map(([k, v]) => (
            <StaggerItem key={k}>
              <div className="border-t-2 border-ink pt-5">
                <p className="text-2xl font-semibold text-ink">{v}</p>
                <p className="mt-1 text-sm font-medium text-ink">{k}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="border-t border-line bg-surface py-20">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Производство</p>
            <h2 className="h-section mt-3 max-w-2xl">Шесть этапов — от глины до готовой плиты</h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map(([n, t, d]) => (
              <StaggerItem key={n}>
                <div>
                  <span className="text-xs font-semibold tracking-wide2 text-accent">{n}</span>
                  <h3 className="mt-2 text-base font-medium text-ink">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="container-x py-20">
        <Reveal>
          <p className="eyebrow">Укладка и уход</p>
          <h2 className="h-section mt-3 max-w-2xl">Как работать с керамогранитом</h2>
        </Reveal>
        <StaggerGroup className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {CARE_STEPS.map((s) => (
            <StaggerItem key={s.title}>
              <div className="border-t-2 border-line pt-5">
                <h3 className="text-base font-medium text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </PageShell>
  );
}
