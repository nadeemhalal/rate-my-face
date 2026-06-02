import type { Metadata } from 'next';
import { Space_Mono, Syne } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
});

export const metadata: Metadata = {
  title: 'Rate My Face — AI Face Analyser',
  description:
    'Upload your photo for a fun, AI-powered face analysis. Vibe-based entertainment only.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
