
import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google'; // Changed from Geist to Inter
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ // Changed from geistSans = Geist
  variable: '--font-inter', // Changed from --font-geist-sans
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}> {/* Changed from geistSans.variable */}
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
