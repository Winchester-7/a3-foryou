/**
 * Cards of the catalogue directions: a tall interior photo, the name and how much
 * is in it. Used on the catalogue page and on the home page.
 * @author Erbol king
 */
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getCategoryCollections } from '@/lib/catalog';
import { blurData } from '@/lib/media';
import { plural } from '@/lib/color';

export function DirectionGrid() {
  const categories = getCategories();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {categories.map((c, i) => {
        const list = getCategoryCollections(c.slug);
        const decors = list.reduce((n, x) => n + x.products.length, 0);
        return (
          <Link
            key={c.slug}
            href={`/catalog/${c.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-surface"
          >
            <Image
              src={c.cover}
              alt={c.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-[900ms] ease-out-strong group-hover:scale-[1.05]"
              placeholder="blur"
              blurDataURL={blurData('#d9d3c9')}
              priority={i < 4}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14110e]/80 via-[#14110e]/10 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
            <span className="absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold tabular-nums tracking-wide2 text-ink backdrop-blur sm:left-5 sm:top-5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-6 sm:bottom-6">
              <p className="text-xl font-medium leading-tight tracking-[-0.01em] sm:text-2xl">{c.menuTitle}</p>
              <p className="mt-1.5 hidden max-w-[22ch] text-xs leading-snug text-white/75 sm:block">{c.tagline}</p>
              <p className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-wide2 text-white/80">
                {decors} {plural(decors, 'декор', 'декора', 'декоров')}
                <svg width="14" height="14" viewBox="0 0 16 16" className="transition-transform duration-300 ease-out-strong group-hover:translate-x-1" aria-hidden>
                  <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </p>
            </div>
          </Link>
        );
      })}

      <Link
        href="/catalog#vse-kollekcii"
        className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl bg-ink p-5 text-paper sm:p-6"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide2 text-paper/60">Все заводы</span>
        <div>
          <p className="text-xl font-medium leading-tight sm:text-2xl">Все коллекции сразу</p>
          <p className="mt-2 text-xs leading-snug text-paper/70">IDALGO, GRANITEA, KERRANOVA, GRASARO, Аксима</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide2 text-accent-soft">
            Смотреть
            <svg width="14" height="14" viewBox="0 0 16 16" className="transition-transform duration-300 ease-out-strong group-hover:translate-x-1" aria-hidden>
              <path d="M3 8h10M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}
