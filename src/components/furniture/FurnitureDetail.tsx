'use client';

/** @author Erbol king */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { blurData } from '@/lib/media';
import { ColorPicker, type Swatch } from './ColorPicker';
import { useLeadDialog } from '@/components/forms/LeadDialog';
import { usePathname } from 'next/navigation';
import { AddToCart } from '@/components/cart/AddToCart';

export function FurnitureDetail({
  kicker,
  title,
  subtitle,
  description,
  colors,
  colorLabel,
  sizes,
  sizeUnit = 'см',
  specs,
  gallery,
  requestSubject,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  description: string;
  colors: Swatch[];
  colorLabel: string;
  sizes: string[];
  sizeUnit?: 'см' | 'мм';
  specs: [string, string][];
  gallery: string[];
  requestSubject: string;
}) {
  const { open } = useLeadDialog();
  const pathname = usePathname();
  const kind = pathname.startsWith('/sofas') ? 'sofa' : 'door';
  const [color, setColor] = useState(colors[0]?.name ?? '');
  const [size, setSize] = useState(sizes[0] ?? '');
  const [imgIdx, setImgIdx] = useState(0);

  const activeColor = colors.find((c) => c.name === color);
  const images = useMemo(() => {
    const list = [...gallery];
    if (activeColor?.image && !list.includes(activeColor.image)) list.unshift(activeColor.image);
    return list.length ? list : [''];
  }, [gallery, activeColor]);

  const shown = activeColor?.image ?? images[imgIdx] ?? images[0];

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface">
            {shown ? (
              <Image
                key={shown}
                src={shown}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={`img-in ${kind === 'door' ? 'object-contain p-6 mix-blend-multiply' : 'object-cover'}`}
                placeholder="blur"
                blurDataURL={blurData('#e8e4de')}
                priority
              />
            ) : null}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.slice(0, 5).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => {
                    setImgIdx(i);
                    setColor(colors.find((c) => c.image === src)?.name ?? color);
                  }}
                  className={`relative aspect-square overflow-hidden rounded-xl ring-1 transition ${
                    src === shown ? 'ring-accent' : 'ring-line hover:ring-ink-faint'
                  }`}
                  aria-label={`Фото ${i + 1}`}
                >
                  {src ? <Image src={src} alt="" fill sizes="120px" className={kind === 'door' ? 'object-contain p-1 mix-blend-multiply' : 'object-cover'} /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{kicker}</p>
          <h1 className="h-section mt-3">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
          <p className="mt-4 text-xl font-medium text-ink">Цена по запросу</p>
          <p className="mt-5 max-w-prose2 text-[15px] leading-relaxed text-ink-soft">{description}</p>

          {colors.length > 1 && (
            <div className="mt-8">
              <ColorPicker
                swatches={colors}
                activeName={color}
                label={colorLabel}
                onSelect={(s) => {
                  setColor(s.name);
                  const idx = images.indexOf(s.image ?? '');
                  if (idx >= 0) setImgIdx(idx);
                }}
              />
            </div>
          )}

          {sizes.length > 1 && (
            <div className="mt-7">
              <p className="text-[13px] font-medium uppercase tracking-wide2 text-ink">Размер, {sizeUnit}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={s === size}
                    className={`rounded-full border px-4 py-2 text-xs transition-[color,background-color,border-color,transform] duration-200 ease-out-strong active:scale-[0.96] ${
                      s === size ? 'border-accent bg-accent text-paper' : 'border-line text-ink-soft hover:border-ink-faint hover:text-ink'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AddToCart
            className="mt-8"
            item={{
              id: `${kind}:${pathname}|${color}|${size}`,
              kind,
              title,
              details: [kicker, color && `${colorLabel.toLowerCase()}: ${color}`, size && `размер: ${size} ${sizeUnit}`].filter(Boolean).join(' · '),
              image: activeColor?.image ?? images[0],
              href: pathname,
            }}
          />
          <button
            type="button"
            onClick={() => open('request', `${requestSubject}${color ? `, цвет: ${color}` : ''}${size ? `, размер: ${size} ${sizeUnit}` : ''}`)}
            className="btn-outline mt-3 w-full"
          >
            Оставить заявку
          </button>

          <div className="mt-10">
            <h2 className="text-[13px] font-medium uppercase tracking-wide2 text-ink">Характеристики</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {(sizes.length ? ([[`Размеры, ${sizeUnit}`, sizes.join(', ')]] as [string, string][]) : []).concat(specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3.5 text-sm">
                  <dt className="shrink-0 text-ink-faint">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
