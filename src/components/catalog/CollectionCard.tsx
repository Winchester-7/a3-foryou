/** @author Erbol king */
import Link from 'next/link';
import type { Collection } from '@/lib/types';
import { formatM2 } from '@/lib/catalog';
import { BrandBadge } from '@/components/brand/BrandLogo';
import { TileImage } from '@/components/media/TileImage';

export function CollectionCard({ collection, priority = false }: { collection: Collection; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/collection/${collection.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
          <div className="absolute inset-0 transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
            <TileImage
              src={collection.hero}
              alt={`${collection.nameRu} — ${collection.name}`}
              priority={priority}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent" />
          <BrandBadge brand={collection.brand} className="absolute left-4 top-4" />
          <div className="absolute inset-x-5 bottom-5 text-white">
            <p className="text-lg font-medium leading-tight">{collection.nameRu}</p>
            <p className="text-[11px] uppercase tracking-wide2 text-white/70">{collection.name}</p>
          </div>
        </div>
      </Link>
      <p className="mt-3 text-xs leading-snug text-ink-faint">
        {collection.products.length}{' '}
        {plural(collection.products.length, 'декор', 'декора', 'декоров')} · {collection.sizes.join(', ')} мм
        {collection.stockM2 ? ` · в наличии ${formatM2(collection.stockM2)}` : ''}
      </p>
    </article>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
