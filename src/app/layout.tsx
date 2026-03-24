import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/sidebar/sidebar';
import { Toaster } from 'sonner';

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
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body
        className={`${inter.variable} antialiased bg-gray-900 text-white flex h-screen`}
      >
        <Sidebar />
        <main className="relative flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 md:p-8 max-w-full md:max-w-3xl mx-auto h-full">
            {children}
          </div>
        </main>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
