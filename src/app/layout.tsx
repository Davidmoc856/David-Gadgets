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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.davidgadgets.com'),
  title: "David Gadgets | Premium Tech Marketplace",
  description: "Secure gadget trading with escrow protection, verified sellers, and logistics tracking.",
  keywords: [
    'tech marketplace',
    'buy phone',
    'sell phone',
    'escrow gadget marketplace',
    'device trade',
    'verified tech store',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'David Gadgets | Premium Tech Marketplace',
    description: 'Secure gadget trading with escrow protection, verified sellers, and logistics tracking.',
    url: '/',
    siteName: 'David Gadgets',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'David Gadgets | Premium Tech Marketplace',
    description: 'Secure gadget trading with escrow protection, verified sellers, and logistics tracking.',
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
