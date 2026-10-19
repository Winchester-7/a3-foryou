/** @author Erbol king */
import Image from 'next/image';
import Link from 'next/link';

/**
 * Full-bleed spotlight for one collection that is in stock right now.
 * Uses the collection's own photo, so the picture always matches the name.
 */
export function CollectionSpotlight({ image, name, text, href }: { image: string; name: string; text: string; href: string }) {
  return (
    <section className="relative isolate h-[62vh] min-h-[440px] max-h-[720px] w-full overflow-hidden bg-ink">
      <Image src={image} alt={`Коллекция «${name}» в интерьере`} fill sizes="100vw" className="object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <div className="container-x relative flex h-full flex-col justify-end pb-14 lg:pb-16">
        <h2 className="max-w-2xl text-balance font-semibold leading-[1.05] tracking-[-0.02em] text-white" style={{ fontSize: 'clamp(2rem, 4.2vw, 3.4rem)' }}>
          Коллекция месяца: «{name}»
        </h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80">{text}</p>
        <Link href={href} className="btn mt-7 w-fit bg-paper text-ink hover:bg-white">
          Открыть коллекцию
        </Link>
      </div>
    </section>
  );
}
