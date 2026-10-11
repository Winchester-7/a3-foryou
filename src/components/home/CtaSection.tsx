/** @author Erbol king */
import Link from 'next/link';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden">
      <ParallaxImage
        src="/tiles/concepta/interior-hero.jpg"
        alt="Керамогранит A3 FOR YOU в интерьере"
        fill
        overlay="from-ink/85 via-ink/70 to-ink/75"
        strength={50}
      />
      <div className="container-x relative py-24 lg:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-brand text-white/60">
              Проект под ключ
            </p>
            <h2 className="mt-4 text-balance font-semibold leading-[1.05] tracking-[-0.02em] text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
              Подберём керамогранит под ваш интерьер за одну встречу
            </h2>
            <p className="mt-5 max-w-lg text-white/75">
              Приходите в шоурум или пришлите планировку — соберём палитру коллекций, рассчитаем объём и подготовим спецификацию.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CallbackTrigger
                kind="consult"
                label="Запросить консультацию"
                className="btn bg-paper text-ink hover:bg-white hover:shadow-float"
              />
              <Link href="/where-to-buy" className="btn border border-white/40 text-white hover:border-white">
                Адреса и точки продаж
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
