"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/cart";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { openCart, itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      } border-b border-[#1AABBD]/15`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/visit-anfeh-delivery-logo.jpg"
            alt="Visit Anfeh Delivery"
            width={140}
            height={140}
            className="h-16 w-16 rounded-xl object-cover"
            priority
          />
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-[#1AABBD] md:block">
            Anfeh, Lebanon 🇱🇧
          </span>

          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-xl bg-[#1AABBD] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#168fa0] active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F9B233] text-xs font-black text-[#0C2B35]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
