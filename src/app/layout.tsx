/** @author Erbol king */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { getSite } from '@/lib/site-server';
import { SiteProvider } from '@/components/layout/SiteProvider';
import { ChromeGate } from '@/components/layout/ChromeGate';
import { LeadDialogProvider } from '@/components/forms/LeadDialog';
import { Footer } from '@/components/layout/Footer';
import { FloatingContacts } from '@/components/layout/FloatingContacts';
import { CartProvider } from '@/components/cart/CartProvider';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { Intro } from '@/components/intro/Intro';

const HEAD_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('js');var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;var s=0;try{s=sessionStorage.getItem('a3-intro-seen')}catch(e){}if(location.pathname==='/'&&!s&&!r){d.classList.add('intro-on')}else{d.classList.add('no-intro')}}catch(e){}})();`;

/** Content is edited in the admin panel and must show up on the next request. */
export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — керамогранит под любой интерьер и бюджет`,
    template: `%s — ${site.name}`,
  },
  description: site.shortDescription,
  keywords: [
    'керамогранит Бишкек', 'керамогранит Кыргызстан', 'керамогранит под дерево',
    'керамогранит под мрамор', 'керамогранит под бетон', 'плитка для ванной',
    'фасадный керамогранит', 'IDALGO', 'GRANITEA', 'Уральский Гранит', 'A3 FOR YOU',
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — керамогранит под любой интерьер и бюджет`,
    description: site.shortDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — керамогранит под любой интерьер и бюджет`,
    description: site.shortDescription,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: site.name,
    description: site.shortDescription,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Бишкек',
      streetAddress: site.street,
      addressCountry: 'KG',
    },
    areaServed: 'Кыргызстан',
    openingHours: 'Mo-Su 09:00-19:00',
    sameAs: site.socials.map((s) => s.href),
  };

  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* decides before first paint: do animations hide things (html.js), and does the opening scene play (once per visit, home only) */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <Intro />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          К основному содержанию
        </a>
        <SiteProvider value={site}>
          <LocaleProvider>
            <LeadDialogProvider>
              <CartProvider>
                {children}
                <ChromeGate>
                  <Footer />
                  <FloatingContacts />
                </ChromeGate>
              </CartProvider>
            </LeadDialogProvider>
          </LocaleProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
