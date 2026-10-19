/** @author Erbol king */
import Link from 'next/link';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden">
      <ParallaxImage
        src="/tiles/concepta/interior-hero.jpg"
        alt="Керамогранит A3 FOR YOU в интерьере"
        fill
        overlay="from-ink/85 via-ink/70 to-ink/75"
        strength={0}
      />
      <div className="container-x relative py-24 lg:py-32">
          <div className="max-w-2xl">
            <h2 className="text-balance font-semibold leading-[1.05] tracking-[-0.02em] text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
              Подберём плитку под ваш интерьер за одну встречу
            </h2>
            <p className="mt-5 max-w-lg text-white/75">
              Приходите в шоурум или пришлите планировку в WhatsApp — предложим коллекции, посчитаем количество и подготовим спецификацию.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CallbackTrigger
                kind="consult"
                label="Заказать консультацию"
                className="btn bg-paper text-ink hover:bg-white hover:shadow-float"
              />
              <Link href="/where-to-buy" className="btn border border-white/40 text-white hover:border-white">
                Как нас найти
              </Link>
            </div>
          </div>
      </div>
    </section>
  );
}
