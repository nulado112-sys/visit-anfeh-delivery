"use client";

import { useCart } from "../context/cart";
import { useState } from "react";

const DELIVERY_FEE = 1;
const WHATSAPP_NUMBER = "96181526075";

type CustomerInfo = {
  name: string;
  phone: string;
  location: string;
  notes: string;
};

function buildWhatsAppMessage(
  items: ReturnType<typeof useCart>["items"],
  subtotal: number,
  customer: CustomerInfo,
) {
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    if (!grouped[item.restaurantName]) grouped[item.restaurantName] = [];
    grouped[item.restaurantName].push(item);
  }

  let msg = "🍽️ *Visit Anfeh Delivery — New Order*\n";
  msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

  msg += `👤 *Customer:* ${customer.name}\n`;
  msg += `📞 *Phone:* +961${customer.phone}\n`;
  msg += `📍 *Location:* ${customer.location}\n\n`;

  for (const [restaurant, restaurantItems] of Object.entries(grouped)) {
    msg += `🏪 *${restaurant}*\n`;
    for (const item of restaurantItems) {
      const priceStr =
        item.price !== null
          ? `$${(item.price * item.quantity).toFixed(2)}`
          : `LBP price`;
      msg += `  • ${item.name} ×${item.quantity} — ${priceStr}\n`;
    }
    msg += "\n";
  }

  if (customer.notes.trim()) {
    msg += `📝 *Special Instructions:*\n${customer.notes.trim()}\n\n`;
  }

  msg += "━━━━━━━━━━━━━━━━━━━━\n";
  const hasLbp = items.some((i) => i.price === null);
  msg += `📦 Subtotal: $${subtotal.toFixed(2)}\n`;
  msg += `🚚 Delivery: +$${DELIVERY_FEE}.00\n`;
  msg += `💰 *Total: $${(subtotal + DELIVERY_FEE).toFixed(2)}*`;
  if (hasLbp) msg += ` *(+ LBP items)*`;
  msg += "\n\nPlease confirm my order. Thank you! 🙏";

  return msg;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, clearCart, subtotal, itemCount } =
    useCart();

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });
  const [errors, setErrors] = useState({ name: false, phone: false, location: false });

  const total = subtotal + DELIVERY_FEE;

  function handleOrder() {
    const hasName = customer.name.trim().length > 0;
    const hasPhone = customer.phone.trim().length > 0;
    const hasLocation = customer.location.trim().length > 0;
    if (!hasName || !hasPhone || !hasLocation) {
      setErrors({ name: !hasName, phone: !hasPhone, location: !hasLocation });
      return;
    }
    const msg = buildWhatsAppMessage(items, subtotal, customer);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  function handleClear() {
    clearCart();
    setCustomer({ name: "", phone: "", location: "", notes: "" });
    setErrors({ name: false, phone: false, location: false });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-[#0C2B35] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Order</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="text-5xl">🛒</span>
              <p className="text-lg font-semibold text-slate-300">Your cart is empty</p>
              <p className="text-sm text-slate-500">
                Browse restaurants and add items to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6 px-6 py-5">

              {/* ── Order Items ── */}
              <div>
                <p className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Items
                </p>
                <div className="space-y-4">
                  {Object.entries(
                    items.reduce<Record<string, typeof items>>(
                      (acc, item) => {
                        if (!acc[item.restaurantName]) acc[item.restaurantName] = [];
                        acc[item.restaurantName].push(item);
                        return acc;
                      },
                      {},
                    ),
                  ).map(([restaurant, restaurantItems]) => (
                    <div key={restaurant}>
                      <p className="mb-2 text-xs font-semibold tracking-widest text-[#1AABBD] uppercase">
                        {restaurant}
                      </p>
                      <div className="space-y-2">
                        {restaurantItems.map((item) => (
                          <div
                            key={`${item.restaurantId}-${item.name}`}
                            className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.price !== null ? `$${item.price} each` : "LBP price"}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateQty(item.restaurantId, item.name, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
                              </button>
                              <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.restaurantId, item.name, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1AABBD] text-white transition hover:bg-[#168fa0]"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                              </button>
                            </div>

                            <p className="w-14 text-right text-sm font-bold text-white">
                              {item.price !== null ? `$${(item.price * item.quantity).toFixed(2)}` : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Delivery Details ── */}
              <div>
                <p className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
                  Delivery Details
                </p>
                <div className="space-y-3">

                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Full Name <span className="text-[#1AABBD]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={customer.name}
                      onChange={(e) => {
                        setCustomer((p) => ({ ...p, name: e.target.value }));
                        if (errors.name) setErrors((p) => ({ ...p, name: false }));
                      }}
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:bg-white/10 ${
                        errors.name
                          ? "border-red-500 focus:border-red-400"
                          : "border-white/10 focus:border-[#1AABBD]"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">Please enter your full name</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.76h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 5.69 5.69l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.22 17l-.3-.08z"/>
                      </svg>
                      Phone Number <span className="text-[#1AABBD]">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-300 select-none">
                        +961
                      </div>
                      <input
                        type="tel"
                        placeholder=""
                        value={customer.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                          setCustomer((p) => ({ ...p, phone: val }));
                          if (errors.phone) setErrors((p) => ({ ...p, phone: false }));
                        }}
                        className={`flex-1 rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:bg-white/10 ${
                          errors.phone
                            ? "border-red-500 focus:border-red-400"
                            : "border-white/10 focus:border-[#1AABBD]"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400">Please enter your phone number</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      Delivery Location <span className="text-[#1AABBD]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={customer.location}
                      onChange={(e) => {
                        setCustomer((p) => ({ ...p, location: e.target.value }));
                        if (errors.location) setErrors((p) => ({ ...p, location: false }));
                      }}
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:bg-white/10 ${
                        errors.location
                          ? "border-red-500 focus:border-red-400"
                          : "border-white/10 focus:border-[#1AABBD]"
                      }`}
                    />
                    {errors.location && (
                      <p className="mt-1 text-xs text-red-400">Please enter your delivery location</p>
                    )}
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                      </svg>
                      Special Instructions
                      <span className="ml-1 font-normal text-slate-500">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder=""
                      value={customer.notes}
                      onChange={(e) => setCustomer((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#1AABBD] focus:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* ── Price Summary ── */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery fee</span>
                  <span>+${DELIVERY_FEE}.00</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-3">
            <button
              onClick={handleOrder}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/20 transition hover:bg-[#1ebe5c] active:scale-[0.98]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Place Order via WhatsApp
            </button>

            <button
              onClick={handleClear}
              className="w-full text-center text-xs text-slate-600 transition hover:text-slate-400"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
