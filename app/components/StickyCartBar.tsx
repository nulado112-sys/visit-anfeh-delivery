"use client";

import { useCart } from "../context/cart";
import { useLang, t } from "../context/language";

export default function StickyCartBar() {
  const { items, isOpen, openCart, subtotal, itemCount } = useCart();
  const { lang } = useLang();
  const T = t[lang];

  if (isOpen || itemCount === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 px-4 w-full max-w-sm">
      <button
        onClick={openCart}
        className="flex w-full items-center justify-between rounded-2xl bg-[#0C2B35] px-5 py-3.5 shadow-2xl shadow-black/30 transition hover:bg-[#0f3340] active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#1AABBD]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F9B233] text-[10px] font-black text-[#0C2B35]">
              {itemCount}
            </span>
          </div>
          <span className="text-sm font-semibold text-white">
            {itemCount} {lang === "ar" ? "صنف" : itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-black text-[#F9B233]">${subtotal.toFixed(2)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </button>
    </div>
  );
}
