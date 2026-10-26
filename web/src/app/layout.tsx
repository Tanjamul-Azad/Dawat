import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans, Hind_Siliguri } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import './product-ui.css';
import { ProductLocale } from '@/components/production/product-locale';
import { appOrigin, brandShare, storefrontMetadata } from '@/features/production/share';

const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: '400',
  preload: false,
  variable: '--font-display',
});
const ui = Instrument_Sans({ subsets: ['latin'], variable: '--font-ui' });
const banglaUi = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600'],
  variable: '--font-bangla-ui',
  preload: false,
});
const bangla = localFont({
  src: [
    { path: './fonts/noto-serif-bengali-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/noto-serif-bengali-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-bangla',
  preload: false,
  display: 'swap',
  fallback: ['Fraunces', 'Georgia'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  // APP_ORIGIN makes preview images and og:url absolute for link crawlers.
  metadataBase: appOrigin(),
  ...storefrontMetadata({ ...brandShare, path: '/' }),
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${display.variable} ${ui.variable} ${bangla.variable} ${banglaUi.variable}`}>
      <body>
        <ProductLocale>{children}</ProductLocale>
      </body>
    </html>
  );
}
