'use client';

/** @author Erbol king */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import type { Collection, Product } from '@/lib/types';
import { brandName } from '@/lib/catalog';
import { PRICE_LABEL } from '@/lib/catalog';
import { TileImage } from '@/components/media/TileImage';
import { BrandBadge } from '@/components/brand/BrandLogo';
import { useLeadDialog } from '@/components/forms/LeadDialog';
import { AddToCart } from '@/components/cart/AddToCart';
import { tileCartItem } from '@/lib/cart-items';
import { backdrop, easeOut, modalIn, modalOut } from '@/lib/motion';

const ease = easeOut;

export function QuickView({
  data,
  onClose,
}: {
  data: { product: Product; collection: Collection } | null;
  onClose: () => void;
}) {
  const { open } = useLeadDialog();
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [data?.product.slug]);
  useEffect(() => {
    document.body.style.overflow = data ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [data]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 backdrop-blur-sm sm:items-center sm:p-6"
          {...backdrop}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={data.product.nameRu}
            className="relative grid w-full max-w-4xl overflow-hidden rounded-t-3xl bg-paper sm:rounded-3xl md:grid-cols-2"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1, transition: modalIn }}
            exit={{ y: 12, scale: 0.98, opacity: 0, transition: modalOut }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button" aria-label="Закрыть" onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-ink-soft hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" /></svg>
            </button>

            <div className="bg-surface p-3">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <BrandBadge brand={data.collection.brand} className="absolute left-3 top-3 z-10" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="absolute inset-0"
                  >
                    <TileImage src={data.product.images[active] ?? data.product.image} alt={data.product.nameRu} sizes="50vw" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {data.product.images.slice(0, 5).map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 transition ${
                      i === active ? 'ring-accent' : 'ring-line hover:ring-ink-faint'
                    }`}
                    aria-label={`Изображение ${i + 1}`}
                  >
                    <TileImage src={src} alt="" sizes="56px" />
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-7 sm:p-9">
              <p className="eyebrow">{brandName(data.collection.brand)} · Коллекция «{data.collection.nameRu}»</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{data.product.nameRu}</h2>
              <p className="mt-1 text-sm text-ink-soft">{data.product.name}</p>
              <p className="mt-4 text-base font-medium text-ink">{PRICE_LABEL}</p>

              <dl className="mt-6 space-y-3 text-sm">
                {data.product.article && <Row label="Артикул">{data.product.article}</Row>}
                <Row label="Размеры">{data.product.sizes.join(', ')} мм</Row>
                <Row label="Поверхность">{data.product.surfaces.join(', ')}</Row>
                {data.collection.thickness && <Row label="Толщина">{data.collection.thickness}</Row>}
                <Row label="Применение">{data.collection.applications.slice(0, 4).join(', ')}</Row>
              </dl>

              <AddToCart className="mt-7" item={tileCartItem(data.product, data.collection)} />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Link href={`/product/${data.product.slug}`} className="btn-outline flex-1">Открыть товар</Link>
                <button type="button" onClick={() => open('consult', data.product.nameRu)} className="btn-outline flex-1">
                  Консультация
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-line pb-3">
      <dt className="shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}
