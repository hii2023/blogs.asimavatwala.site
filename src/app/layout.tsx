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
  title: 'Altaf Simavatwala — Thoughts & Essays',
  description: 'Personal blog by Altaf Simavatwala. Ideas, observations, and essays on life, business, and everything in between.',
  openGraph: {
    title: 'Altaf Simavatwala — Thoughts & Essays',
    description: 'Personal blog by Altaf Simavatwala.',
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
