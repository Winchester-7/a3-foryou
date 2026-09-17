import Image from 'next/image';
import { blurData } from '@/lib/media';

/**
 * Real product / collection photography from the manufacturer catalogs
 * (ГК «Уральский Гранит» — IDALGO / GRANITEA). Files live in /public/catalog.
 */
export function TileImage({
  src,
  alt,
  sizes = '(max-width: 768px) 50vw, 25vw',
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurData('#e8e4de')}
      className={className ?? 'object-cover'}
    />
  );
}
