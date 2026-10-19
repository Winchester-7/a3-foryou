/** @author Erbol king */
import Link from 'next/link';
import { getCollections } from '@/lib/catalog';
import { BrandLogo, hasBrandLogo } from '@/components/brand/BrandLogo';

/** Factories actually present in the catalog, most collections first. Logos stay grey until hovered. */
export function BrandStrip() {
  const counts = new Map<string, number>();
  for (const c of getCollections()) counts.set(c.brand, (counts.get(c.brand) ?? 0) + 1);
  const brands = Array.from(counts.entries()).filter(([b]) => hasBrandLogo(b)).sort((a, b) => b[1] - a[1]).map(([b]) => b);
  if (brands.length < 2) return null;

  return (
    <section className="container-x pb-6">
      <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:gap-12">
        <p className="shrink-0 text-sm text-ink-soft">Плитка заводов</p>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {brands.map((b) => (
            <li key={b}>
              <Link href={`/catalog?brand=${b}`} className="brand-chip block">
                <BrandLogo brand={b} height={26} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
