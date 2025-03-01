import type { Metadata } from "next";
import { JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import SupabaseProvider from '@/components/providers/SupabaseProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Your Portfolio",
  description: "Interactive portfolio with AI-powered chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={mono.variable}>
      <body className={`${mono.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <SupabaseProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
