import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "./context/cart";
import { LanguageProvider } from "./context/language";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Toast from "./components/Toast";
import StickyCartBar from "./components/StickyCartBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visit Anfeh Delivery",
  description:
    "Order from the best restaurants in Anfeh, Lebanon. Fast delivery, great food.",
  keywords: ["food delivery", "Anfeh", "Lebanon", "restaurants", "delivery", "Lebanese food"],
  authors: [{ name: "Marketing Leads" }],
  creator: "Marketing Leads",
  openGraph: {
    title: "Visit Anfeh Delivery",
    description: "Order from the best restaurants in Anfeh, Lebanon. Fast delivery, great food.",
    url: "https://visitanfeh.delivery",
    siteName: "Visit Anfeh Delivery",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Visit Anfeh Delivery - Order from the best restaurants in Anfeh, Lebanon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visit Anfeh Delivery",
    description: "Order from the best restaurants in Anfeh, Lebanon. Fast delivery, great food.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#F4FAFB] font-sans antialiased overflow-x-hidden min-h-screen">
        <LanguageProvider>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <Toast />
          <StickyCartBar />
{children}
          <footer className="mt-16 border-t border-[#1AABBD]/15 bg-white py-10 text-center">
            <p className="text-sm font-bold text-[#0C2B35]">
              Visit Anfeh Delivery
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Anfeh, Lebanon · Your trusted delivery partner · 81-526075
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Created by{" "}
              <a
                href="https://www.instagram.com/marketingleadsss"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1AABBD] hover:underline"
              >
                Marketing Leads
              </a>
            </p>
          </footer>
        </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
