import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Prompt Manager',
  description: 'Gerencie seus prompts de forma eficiente e organizada.',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('font-sans', 'font-sans', inter.variable)}>
      <body className={`${inter.variable} antialiased bg-gray-900 text-white`}>
        {children}
      </body>
    </html>
  );
}
