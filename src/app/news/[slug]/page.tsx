import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ParallaxImage } from '@/components/media/ParallaxImage';
import { Reveal } from '@/components/motion/Reveal';
import { news, formatDate } from '@/lib/editorial';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = news.find((n) => n.slug === params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.excerpt },
  };
}

export default function NewsPostPage({ params }: { params: { slug: string } }) {
  const post = news.find((n) => n.slug === params.slug);
  if (!post) notFound();

  const more = news.filter((n) => n.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: 'Новости', href: '/news' }, { label: post.title }]} />

      <article className="container-x py-8 lg:py-12">
        <Reveal>
          <p className="text-xs uppercase tracking-wide2 text-ink-faint">
            {post.category} · {formatDate(post.date)}
          </p>
          <h1 className="h-display mt-3 max-w-3xl text-balance">{post.title}</h1>
        </Reveal>

        <Reveal delay={0.1}>
          <ParallaxImage seed={post.imageSeed} alt={post.title} className="mt-10 aspect-[16/9] rounded-3xl" strength={40} />
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-prose2 text-[16px] leading-relaxed text-ink-soft">
            <p className="text-lg text-ink">{post.excerpt}</p>
            <p className="mt-6">
              Керамогранит остаётся самым универсальным отделочным материалом: он одинаково уместен на полу гостиной,
              на фасаде здания и на открытой террасе. В этом материале мы разбираем детали и показываем, как применить
              решение в реальном проекте.
            </p>
            <p className="mt-6">
              Специалисты A3 FOR YOU помогают на всех этапах — от подбора коллекции и расчёта количества до авторского
              надзора на объекте. Запишитесь на консультацию в шоуруме в Бишкеке или отправьте планировку, и мы
              подготовим спецификацию с раскладкой.
            </p>
            <p className="mt-6">
              Больше материалов — в разделе «Новости». Актуальные предложения по коллекциям смотрите в разделе «Акции».
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-10 max-w-prose2">
          <Link href="/news" className="link-underline text-sm font-medium uppercase tracking-wide2 text-ink">
            ← Ко всем новостям
          </Link>
        </div>
      </article>

      <section className="border-t border-line bg-surface py-16">
        <div className="container-x">
          <h2 className="h-section">Ещё по теме</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {more.map((m) => (
              <Link key={m.slug} href={`/news/${m.slug}`} className="group block">
                <p className="text-xs uppercase tracking-wide2 text-ink-faint">{formatDate(m.date)}</p>
                <h3 className="mt-2 text-base font-medium text-ink transition-colors group-hover:text-accent">
                  {m.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
