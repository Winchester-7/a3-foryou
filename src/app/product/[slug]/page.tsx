/** @author Erbol king */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductActions } from '@/components/product/ProductActions';
import { RelatedProducts } from '@/components/catalog/RelatedProducts';
import { Reveal } from '@/components/motion/Reveal';
import { ColorPicker } from '@/components/furniture/ColorPicker';
import { colorHex } from '@/lib/color';
import { allProducts, getProduct, getRelatedProducts, getLook, brandName, getCollectionByProduct, formatM2, productStockM2, PRICE_LABEL } from '@/lib/catalog';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { TECH_SPECS } from '@/lib/specs';
import { site } from '@/lib/site';
import { tileCartItem } from '@/lib/cart-items';

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const hit = getProduct(params.slug);
  if (!hit) return {};
  const { product, collection } = hit;
  return {
    title: `${product.nameRu} — ${collection.nameRu}`,
    description: `${product.nameRu} (${product.name}), ${brandName(collection.brand)}. ${collection.description}`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: `${product.nameRu} — ${site.name}`, description: collection.tagline, images: product.image ? [product.image] : [] },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const hit = getProduct(params.slug);
  if (!hit) notFound();
  const { product, collection } = hit;
  const look = getLook(collection.look)!;

  const related = getRelatedProducts(collection, product.slug, 4).map((p) => ({
    product: p,
    collection: getCollectionByProduct(p.slug) ?? collection,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.nameRu} (${product.name})`,
    sku: product.article,
    description: collection.description,
    category: look.title,
    brand: { '@type': 'Brand', name: brandName(collection.brand) },
    image: product.images,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KGS',
      availability: 'https://schema.org/InStock',
      url: `${site.url}/product/${product.slug}`,
      seller: { '@type': 'Organization', name: site.name },
    },
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: 'Каталог', href: '/catalog' },
          { label: collection.nameRu, href: `/collection/${collection.slug}` },
          { label: product.nameRu },
        ]}
      />

      <div className="container-x py-10 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.nameRu} brand={collection.brand} />

          <Reveal>
            <div>
              <p className="eyebrow">
                <Link href={`/collection/${collection.slug}`} className="hover:text-accent">
                  Коллекция «{collection.nameRu}»
                </Link>
              </p>
              <div className="mt-3">
                <BrandLogo brand={collection.brand} height={30} />
              </div>
              {product.article && (
                <span className="ml-0 mt-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide2 text-accent">
                  Артикул {product.article}
                </span>
              )}
              <h1 className="h-section mt-3">{product.nameRu}</h1>
              <p className="mt-1 text-sm text-ink-soft">{product.name}</p>
              {productStockM2(product) > 0 && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f8f4c]/10 px-3.5 py-1.5 text-sm font-medium text-[#1f8f4c]">
                  <span className="h-2 w-2 rounded-full bg-[#1f8f4c]" /> В наличии · {formatM2(productStockM2(product))}
                </p>
              )}
              <p className="mt-4 text-xl font-medium text-ink">{PRICE_LABEL}</p>
              <p className="mt-5 max-w-prose2 text-[15px] leading-relaxed text-ink-soft">{collection.description}</p>

              {collection.products.length > 1 && (
                <div className="mt-7">
                  <ColorPicker
                    label="Цвет / декор"
                    activeName={product.color}
                    swatches={collection.products.map((p) => ({
                      name: p.color,
                      hex: colorHex(`${p.nameRu} ${p.color}`),
                      href: `/product/${p.slug}`,
                      image: p.image,
                    }))}
                  />
                </div>
              )}

              <ProductActions
                productName={`${product.nameRu} — ${collection.nameRu}`}
                cartItem={tileCartItem(product, collection)}
              />

              <div className="mt-10">
                <h2 className="text-[13px] font-medium uppercase tracking-wide2 text-ink">Характеристики</h2>
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  {[
                    ['Коллекция', collection.nameRu],
                    ['Бренд', brandName(collection.brand)],
                    ['Тип', look.title],
                    ['Цвет / декор', product.color],
                    ['Размеры, мм', product.sizes.join(', ')],
                    ['Толщина', collection.thickness],
                    ['Поверхность', product.surfaces.join(', ')],
                    ['Материал', 'Керамогранит'],
                    ['Применение', collection.applications.join(', ')],
                  ]
                    .filter(([, v]) => Boolean(v))
                    .map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-3.5 text-sm">
                      <dt className="shrink-0 text-ink-faint">{k}</dt>
                      <dd className="text-right text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {product.stock && product.stock.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-[13px] font-medium uppercase tracking-wide2 text-ink">Наличие на складе</h2>
                  <table className="mt-4 w-full border-y border-line text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide2 text-ink-faint">
                        <th className="py-3 font-medium">Формат, мм</th>
                        <th className="py-3 font-medium">Поверхность</th>
                        <th className="py-3 text-right font-medium">Шт.</th>
                        <th className="py-3 text-right font-medium">м²</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {product.stock.map((s) => (
                        <tr key={`${s.size}-${s.surface}`}>
                          <td className="py-3 text-ink">{s.size || '—'}</td>
                          <td className="py-3 text-ink-soft">{s.surface || '—'}</td>
                          <td className="py-3 text-right tabular-nums text-ink">{s.pcs.toLocaleString('ru-RU')}</td>
                          <td className="py-3 text-right tabular-nums text-ink">{Math.round(s.m2).toLocaleString('ru-RU')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-ink-faint">Остатки по данным склада в Бишкеке, уточняйте при заказе.</p>
                </div>
              )}

              {['idalgo', 'granitea', 'uralgranit'].includes(collection.brand) && (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {TECH_SPECS.slice(0, 3).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-surface p-4">
                      <p className="text-lg font-semibold text-ink">{v}</p>
                      <p className="mt-1 text-xs text-ink-faint">{k}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <RelatedProducts items={related} title={`Другие декоры «${collection.nameRu}»`} />
    </PageShell>
  );
}
