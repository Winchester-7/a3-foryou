import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { LeadDialogProvider } from '@/components/forms/LeadDialog';
import { Footer } from '@/components/layout/Footer';
import { FloatingContacts } from '@/components/layout/FloatingContacts';

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
    default: `${site.name} — премиальный керамогранит для современных интерьеров`,
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
    title: `${site.name} — премиальный керамогранит`,
    description: site.shortDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — премиальный керамогранит`,
    description: site.shortDescription,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      streetAddress: site.address,
      addressCountry: 'KG',
    },
    areaServed: 'Кыргызстан',
    openingHours: 'Mo-Su 09:00-19:00',
    sameAs: site.socials.map((s) => s.href),
  };

  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
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
        <LeadDialogProvider>
          {children}
          <Footer />
          <FloatingContacts />
        </LeadDialogProvider>
      </body>
    </html>
  );
}
