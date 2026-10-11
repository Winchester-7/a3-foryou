/** @author Erbol king */
import Link from 'next/link';
import { site } from '@/lib/site';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, flush = false }: { items: Crumb[]; flush?: boolean }) {
  const all: Crumb[] = [{ label: 'Главная', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? `${site.url}${c.href}` : undefined,
    })),
  };

  return (
    <nav
      aria-label="Хлебные крошки"
      className={`container-x ${flush ? 'pt-7' : 'pt-[calc(var(--header-h)+28px)]'}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="transition-colors hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink-soft">{c.label}</span>
            )}
            {i < all.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
