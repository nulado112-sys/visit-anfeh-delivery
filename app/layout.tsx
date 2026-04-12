import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "./context/cart";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#FFF8F0] font-sans antialiased">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          {children}
          <footer className="mt-16 border-t border-slate-200 bg-white py-10 text-center">
            <p className="text-sm font-bold text-[#0C2B35]">
              Visit Anfeh Delivery
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Anfeh, Lebanon · Your trusted delivery partner · 81-526075
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
