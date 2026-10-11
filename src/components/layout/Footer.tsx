/** @author Erbol king */
import Link from 'next/link';
import { categories } from '@/lib/catalog';
import { site } from '@/lib/site';
import { Logo } from '@/components/brand/Logo';
import { CallbackTrigger } from '@/components/forms/CallbackTrigger';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-soft">
              {site.shortDescription}
            </p>
            <div className="mt-6 flex gap-3">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-line px-4 py-2 text-[11px] uppercase tracking-wide2 text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Каталог">
            <p className="eyebrow">Каталог</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalog/${c.slug}`} className="text-ink-soft transition-colors hover:text-ink">
                    {c.menuTitle}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/catalog" className="text-ink transition-colors hover:text-accent">
                  Весь каталог →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Двери, диваны и интерьер">
            <p className="eyebrow">Двери и мебель</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li>
                <Link href="/doors" className="text-ink-soft transition-colors hover:text-ink">Двери</Link>
              </li>
              <li>
                <Link href="/sofas" className="text-ink-soft transition-colors hover:text-ink">Диваны и кресла</Link>
              </li>
              <li>
                <a href={site.plannerUrl} className="text-ink-soft transition-colors hover:text-ink">Создать свой интерьер</a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow">Контакты · Бишкек</p>
            <address className="mt-5 space-y-2 text-sm not-italic text-ink-soft">
              <p>{site.address}</p>
              <p>{site.hours}</p>
              <a href={`tel:${site.phoneHref}`} className="block font-medium text-ink">
                {site.phone}
              </a>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noreferrer noopener"
                className="block font-medium text-accent hover:text-accent-ink"
              >
                WhatsApp: {site.whatsappNumber}
              </a>
              <a href={`mailto:${site.email}`} className="block text-ink-soft hover:text-ink">
                {site.email}
              </a>
            </address>
            <CallbackTrigger className="btn-accent mt-6 w-full sm:w-auto" label="Заказать звонок" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Все права защищены.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/where-to-buy" className="hover:text-ink">Где купить</Link>
            <Link href="/about" className="hover:text-ink">О продукции</Link>
            <Link href="/portfolio" className="hover:text-ink">Портфолио</Link>
            <Link href="/promotions" className="hover:text-ink">Акции</Link>
            <span>Политика конфиденциальности</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
