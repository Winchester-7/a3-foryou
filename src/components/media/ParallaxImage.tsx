'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { blurData, photoUrl } from '@/lib/media';

export function ParallaxImage({
  src,
  seed,
  alt,
  width = 1920,
  height = 1200,
  strength = 60,
  className,
  fill = false,
  priority = false,
  grayscale = false,
  overlay = 'from-ink/10 via-transparent to-transparent',
}: {
  src?: string;
  seed?: string;
  alt: string;
  width?: number;
  height?: number;
  strength?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  grayscale?: boolean;
  overlay?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);
  const source = src ?? photoUrl(seed ?? 'a3', width, height, { grayscale });

  return (
    <div
      ref={ref}
      className={`${fill ? 'absolute inset-0 h-full w-full' : 'relative'} overflow-hidden ${className ?? ''}`}
    >
      <motion.div style={reduce ? undefined : { y }} className="absolute inset-0 -top-[12%] bottom-[-12%]">
        <Image
          src={source}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          placeholder="blur"
          blurDataURL={blurData()}
          className="object-cover"
        />
      </motion.div>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${overlay}`} />
    </div>
  );
}
