/** @author Erbol king */
import Image from 'next/image';
import Link from 'next/link';
import { doorModels } from '@/lib/doors';
import { sofaModels } from '@/lib/sofas';
import { site } from '@/lib/site';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

/** Doors, sofas and the 3D planner — the part of the offer beyond tile. */
export function InteriorTeaser() {
  const cards = [
    {
      title: 'Двери',
      text: 'Межкомнатные и входные двери: десятки моделей, цвета и размеры.',
      href: '/doors',
      image: doorModels[0]?.image,
    },
    {
      title: 'Диваны',
      text: 'Диваны и кресла в тканях и цветах под вашу палитру.',
      href: '/sofas',
      image: sofaModels[0]?.image,
    },
    {
      title: 'Создать свой интерьер',
      text: '3D-планировщик: примерьте плитку, двери и мебель в вашей комнате.',
      href: site.plannerUrl,
      external: true,
      image: '/hero/keramo-scene.jpg',
    },
  ] as const;

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Не только плитка"
          title="Цельный интерьер от пола до дверей"
          text="Керамогранит, двери и мебель, подобранные в одну палитру — и 3D-планировщик, чтобы увидеть результат до покупки."
        />

        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((c) => {
            const body = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface2">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(max-width: 768px) 92vw, 31vw"
                      className="object-cover transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-medium text-ink transition-colors group-hover:text-accent">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{c.text}</p>
              </>
            );
            return (
              <StaggerItem key={c.title}>
                {'external' in c ? (
                  <a href={c.href} className="group block">{body}</a>
                ) : (
                  <Link href={c.href} className="group block">{body}</Link>
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
