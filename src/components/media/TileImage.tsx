/** @author Erbol king */
import Image from 'next/image';
import { blurData } from '@/lib/media';

/**
 * Real product / collection photography from the manufacturer sites.
 * Files live in /public/tiles. Models without a photo get a calm placeholder
 * instead of a broken image.
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
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#efebe4] via-[#e4dfd6] to-[#d6d0c5] px-4 text-center"
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden className="text-ink-faint/60">
          <rect x="4" y="4" width="12.5" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <rect x="17.5" y="4" width="12.5" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <rect x="4" y="17.5" width="12.5" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <rect x="17.5" y="17.5" width="12.5" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <span className="text-[10px] font-medium uppercase tracking-wide2 text-ink-faint">Фото скоро</span>
      </div>
    );
  }
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
