import Link from 'next/link';
import { news, formatDate } from '@/lib/editorial';
import { Photo } from '@/components/media/Photo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/motion/Reveal';

export function NewsTeaser() {
  return (
    <section className="container-x py-20 lg:py-28">
      <SectionHeading
        eyebrow="Журнал"
        title="Новости и гиды"
        text="Коллекции, технологии укладки и тренды в отделке — коротко и по делу."
        link={{ href: '/news', label: 'Все материалы' }}
      />

      <StaggerGroup className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-3">
        {news.slice(0, 3).map((post) => (
          <StaggerItem key={post.slug}>
            <Link href={`/news/${post.slug}`} className="group block">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-surface">
                <div className="h-full w-full transition-transform duration-700 ease-out-strong group-hover:scale-[1.04]">
                  <Photo
                    seed={post.imageSeed}
                    width={640}
                    height={426}
                    alt={post.title}
                    sizes="(max-width: 768px) 90vw, 30vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide2 text-ink-faint">
                {post.category} · {formatDate(post.date)}
              </p>
              <h3 className="mt-2 text-lg font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
