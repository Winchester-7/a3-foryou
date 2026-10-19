/** @author Erbol king */
import Image from 'next/image';
import Link from 'next/link';
import { getDoors } from '@/lib/doors';
import { getSofas } from '@/lib/sofas';
import { site } from '@/lib/site';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Doors, sofas and the 3D planner — the part of the offer beyond tile. */
export function InteriorTeaser() {
  const doorModels = getDoors();
  const sofaModels = getSofas();
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
      title: 'Интерьер в 3D',
      text: 'Задайте размеры своей комнаты и примерьте плитку, двери и мебель до покупки.',
      href: site.plannerUrl,
      external: true,
      image: '/hero/hero-showroom.jpg',
    },
  ] as const;

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          title="Двери и мебель в тон плитке"
          text="Подберите всё для комнаты в одном магазине, а в 3D-планировщике посмотрите, как это будет выглядеть вместе."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
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
            return 'external' in c ? (
              <a key={c.title} href={c.href} className="group block">{body}</a>
            ) : (
              <Link key={c.title} href={c.href} className="group block">{body}</Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
