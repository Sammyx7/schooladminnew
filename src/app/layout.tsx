import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SchoolAdmin',
  description: 'School Administration Panel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
