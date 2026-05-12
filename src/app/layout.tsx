import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Present Enough — Altaf Simavatwala',
  description: 'Observations, questions, and uncomfortable truths about responsibility, freedom, systems, inequality, awareness, business, and health.',
  openGraph: {
    title: 'Present Enough — Altaf Simavatwala',
    description: 'Observations, questions, and uncomfortable truths about responsibility, freedom, systems, inequality, awareness, business, and health.',
    siteName: 'blogs.asimavatwala.site',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-paper text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
