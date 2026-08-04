import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SupportWidget from '@/components/SupportWidgets';
import Footer from '@/components/Footer';
import { AppProvider } from '@/context/AppContext'
import OrderTracker from '@/components/OrderTracker';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://davidgadgets.com.ng';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'David Gadgets | Buy Phones, Laptops & Accessories in Lagos',
    template: '%s | David Gadgets',
  },
  description: 'Buy certified original phones, laptops, and accessories with escrow protection.',
  keywords: [
    'buy phones in Lagos',
    'laptops in Lagos',
    'phone accessories Nigeria',
    'trusted tech marketplace',
    'escrow gadget marketplace',
    'verified phone store',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'David Gadgets',
    title: 'David Gadgets | Buy Phones, Laptops & Accessories in Lagos',
    description: 'Buy certified original phones, laptops, and accessories with escrow protection.',
    url: siteUrl,
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'David Gadgets | Buy Phones, Laptops & Accessories in Lagos',
    description: 'Buy certified original phones, laptops, and accessories with escrow protection.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950">
        <AppProvider>
        <Navbar />
        {children}
        <Footer />
        <SupportWidget />
        <OrderTracker />
        </AppProvider>
      </body>
    </html>
  );
}
