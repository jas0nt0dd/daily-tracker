import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Daily Life OS',
  description: 'Your whole day, in one calm place.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF9F6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
