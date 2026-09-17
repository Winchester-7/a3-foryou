import Image from 'next/image';
import { blurData, photoUrl } from '@/lib/media';

export function Photo({
  seed,
  width,
  height,
  alt,
  className,
  sizes = '100vw',
  priority = false,
  grayscale = false,
}: {
  seed: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  grayscale?: boolean;
}) {
  return (
    <Image
      src={photoUrl(seed, width, height, { grayscale })}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurData()}
      className={className}
    />
  );
}
