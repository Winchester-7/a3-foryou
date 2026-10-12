/** @author Erbol king */
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Reveal } from '@/components/motion/Reveal';
import { getCollection } from '@/lib/catalog';
import { getProject, getPortfolio } from '@/lib/portfolio';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getProject(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description ?? project.subtitle,
    alternates: { canonical: `/portfolio/${project.slug}` },
  };
}

export default function PortfolioProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();

  const used = (project.collections ?? [])
    .map((s) => getCollection(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const more = getPortfolio().filter((p) => p.slug !== project.slug).slice(0, 3);
  const images = [project.cover, ...project.gallery.filter((g) => g !== project.cover)];

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: 'Портфолио', href: '/portfolio' }, { label: project.title }]} />

      <article className="container-x py-8 lg:py-12">
        <Reveal>
          <p className="text-xs uppercase tracking-wide2 text-ink-faint">
            {project.kind}
            {project.year ? ` · ${project.year}` : ''}
          </p>
          <h1 className="h-display mt-3 max-w-3xl text-balance">{project.title}</h1>
          {project.subtitle && <p className="mt-4 max-w-prose2 text-lg text-ink-soft">{project.subtitle}</p>}
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {images.map((src, i) => (
            <Reveal key={src} delay={Math.min(i, 3) * 0.05}>
              <div className={`relative overflow-hidden rounded-3xl bg-surface ${i === 0 ? 'aspect-[16/10] md:col-span-2' : 'aspect-[4/3]'}`}>
                <Image
                  src={src}
                  alt={`${project.title} — фото ${i + 1}`}
                  fill
                  sizes={i === 0 ? '(max-width: 1280px) 94vw, 1200px' : '(max-width: 768px) 94vw, 46vw'}
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            </Reveal>
          ))}
        </div>

        {(project.description || used.length > 0) && (
          <div className="mx-auto mt-12 max-w-prose2 text-[16px] leading-relaxed text-ink-soft">
            {project.description && <p>{project.description}</p>}
            {used.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow">Использованные коллекции</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {used.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/collection/${c.slug}`}
                        className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-wide2 text-ink-soft hover:border-accent hover:text-accent"
                      >
                        {c.nameRu}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mx-auto mt-10 max-w-prose2">
          <Link href="/portfolio" className="link-underline text-sm font-medium uppercase tracking-wide2 text-ink">
            ← Всё портфолио
          </Link>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-line bg-surface py-16">
          <div className="container-x">
            <h2 className="h-section">Другие проекты</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {more.map((m) => (
                <Link key={m.slug} href={`/portfolio/${m.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface2">
                    <Image src={m.cover} alt={m.title} fill sizes="(max-width: 768px) 92vw, 30vw" className="object-cover transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]" />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-ink transition-colors group-hover:text-accent">{m.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
