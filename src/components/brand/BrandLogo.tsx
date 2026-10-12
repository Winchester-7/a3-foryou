/**
 * Manufacturer logo. Uses the supplied artwork when we have it and falls back
 * to a quiet text wordmark for factories without a logo file.
 * @author Erbol king
 */
import Image from 'next/image';
import { brandName } from '@/lib/brands';

const LOGO_FILES: Record<string, { src: string; w: number; h: number }> = {
  idalgo: { src: '/brands/idalgo.png', w: 426, h: 148 },
  granitea: { src: '/brands/granitea.png', w: 570, h: 148 },
  uralgranit: { src: '/brands/uralgranit.png', w: 458, h: 148 },
};

export function hasBrandLogo(brand: string): boolean {
  return brand in LOGO_FILES;
}

/** Inline logo (or wordmark) at a fixed height — used in headings and spec rows. */
export function BrandLogo({ brand, height = 22, className = '' }: { brand: string; height?: number; className?: string }) {
  const file = LOGO_FILES[brand];
  if (!file) {
    return (
      <span className={`font-semibold uppercase tracking-wide2 text-ink ${className}`} style={{ fontSize: Math.max(10, height * 0.5) }}>
        {brandName(brand)}
      </span>
    );
  }
  return (
    <Image
      src={file.src}
      alt={brandName(brand)}
      width={Math.round((file.w / file.h) * height)}
      height={height}
      className={`w-auto ${className}`}
      style={{ height }}
    />
  );
}

/** White pill with the logo — sits in the corner of a tile photo. */
export function BrandBadge({ brand, className = '' }: { brand: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur ${className}`}
      title={brandName(brand)}
    >
      <BrandLogo brand={brand} height={16} />
    </span>
  );
}
