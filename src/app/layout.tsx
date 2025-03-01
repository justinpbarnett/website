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
  title: "Justin P Barnett",
  description: "Interactive portfolio with AI-powered chat",
  metadataBase: new URL('https://justinpbarnett.com'),
  openGraph: {
    title: "Justin P Barnett",
    description: "Interactive portfolio with AI-powered chat",
    type: "website",
    siteName: "Justin P Barnett",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Justin P Barnett - Interactive portfolio with AI-powered chat"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Justin P Barnett",
    description: "Interactive portfolio with AI-powered chat",
    images: ["/og.png"],
    creator: "@justinpbarnett"
  }
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
