"use client";

import { useCart } from "../context/cart";
import { useLang, t } from "../context/language";
import { useAuth } from "../context/auth";
import { supabase, generateOrderNumber } from "../lib/supabase";
import { useState } from "react";

const WHATSAPP_NUMBER = "96181526075";

const DELIVERY_ZONES = [
  { label: "Anfeh", fee: 1 },
  { label: "Chekka", fee: 3 },
];

type CustomerInfo = {
  name: string;
  phone: string;
  zone: string;
  location: string;
  notes: string;
};

function buildWhatsAppMessage(
  items: ReturnType<typeof useCart>["items"],
  subtotal: number,
  customer: CustomerInfo,
  deliveryFee: number,
  orderNumber: string,
  trackUrl: string,
) {
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    if (!grouped[item.restaurantName]) grouped[item.restaurantName] = [];
    grouped[item.restaurantName].push(item);
  }

  let msg = `🛒 *New Order — Visit Anfeh Delivery*\n`;
  msg += `📋 *Order: ${orderNumber}*\n`;
  msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

  for (const [restaurant, restaurantItems] of Object.entries(grouped)) {
    msg += `🏪 *Restaurant:* ${restaurant}\n\n`;
    msg += `*Items:*\n`;
    for (const item of restaurantItems) {
      const priceStr = item.price !== null
        ? `$${item.price}`
        : item.priceLbp !== null
          ? `${(item.priceLbp / 1_000_000).toFixed(2)}M LBP`
          : `LBP`;
      msg += `- ${item.name} ×${item.quantity} (${priceStr})\n`;
    }
    msg += "\n";
  }

  msg += "━━━━━━━━━━━━━━━━━━━━\n";
  const hasLbp = items.some((i) => i.price === null);
  msg += `Subtotal: $${subtotal.toFixed(2)}\n`;
  msg += `Delivery (${customer.zone}): $${deliveryFee.toFixed(2)}\n`;
  msg += `*Total: $${(subtotal + deliveryFee).toFixed(2)}*`;
  if (hasLbp) msg += ` *(+ LBP items)*`;
  msg += "\n\n";

  msg += "━━━━━━━━━━━━━━━━━━━━\n";
  msg += `👤 *Customer:*\n`;
  msg += `Name: ${customer.name}\n`;
  msg += `Phone: +961${customer.phone}\n\n`;
  msg += `📍 *Address (${customer.zone}):*\n${customer.location}\n`;

  if (customer.notes.trim()) {
    msg += `\n📝 *Notes:*\n${customer.notes.trim()}`;
  }

  msg += "\n\n💵 *Payment: Cash on delivery*";
  msg += `\n\n🔗 *Track order:* ${trackUrl}`;
  msg += "\n\nPlease confirm my order. Thank you! 🙏";

  return msg;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, clearCart, subtotal, subtotalLbp, itemCount } = useCart();
  const { lang } = useLang();
  const { user } = useAuth();
  const T = t[lang];

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "", phone: "", zone: DELIVERY_ZONES[0].label, location: "", notes: "",
  });
  const [errors, setErrors] = useState({ name: false, phone: false, location: false });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const deliveryFee = DELIVERY_ZONES.find((z) => z.label === customer.zone)?.fee ?? 1;
  const total = subtotal + deliveryFee;

  function validate() {
    const e = {
      name: customer.name.trim().length === 0,
      phone: customer.phone.trim().length === 0,
      location: customer.location.trim().length === 0,
    };
    setErrors(e);
    return !e.name && !e.phone && !e.location;
  }

  function handleOrderClick() {
    if (!user) {
      closeCart();
      window.location.href = "/auth/login";
      return;
    }
    if (!validate()) return;
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setShowConfirm(false);
    setLoading(true);

    const orderNum = generateOrderNumber();

    // Save order to Supabase
    await supabase.from("orders").insert({
      order_number: orderNum,
      user_id: user!.id,
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      zone: customer.zone,
      address: customer.location.trim(),
      notes: customer.notes.trim(),
      items: items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        priceLbp: i.priceLbp ?? null,
      })),
      subtotal,
      subtotal_lbp: subtotalLbp,
      delivery_fee: deliveryFee,
      total: subtotal + deliveryFee,
      status: "pending",
    });

    setOrderNumber(orderNum);

    const trackUrl = `${window.location.origin}/track/${orderNum}`;
    const msg = buildWhatsAppMessage(items, subtotal, customer, deliveryFee, orderNum, trackUrl);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
    clearCart();
    setCustomer({ name: "", phone: "", zone: DELIVERY_ZONES[0].label, location: "", notes: "" });
    setLoading(false);
    // orderNumber state remains set — shows success banner
  }

  function handleClear() {
    clearCart();
    setCustomer({ name: "", phone: "", zone: DELIVERY_ZONES[0].label, location: "", notes: "" });
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

      {/* Confirmation popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF8FA] text-2xl">
              💬
            </div>
            <h3 className="text-lg font-black text-[#0C2B35]">
              {lang === "ar" ? "تأكيد الطلب" : "Confirm your order?"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {lang === "ar"
                ? "سيتم تحويلك إلى واتساب لإتمام طلبك."
                : "You will be redirected to WhatsApp to confirm your order."}
            </p>
            <div className="mt-2 rounded-xl bg-[#F4FAFB] px-4 py-2 text-sm">
              <span className="font-bold text-[#0C2B35]">
                {lang === "ar" ? "المجموع:" : "Total:"} ${total.toFixed(2)}
              </span>
              <span className="ml-2 text-slate-400">
                · {lang === "ar" ? "دفع عند الاستلام" : "Cash on delivery"}
              </span>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {lang === "ar" ? "رجوع" : "Go back"}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:bg-[#1ebe5c]"
              >
                {lang === "ar" ? "تأكيد ✓" : "Confirm ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-[#0C2B35] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{T.cart_title}</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {itemCount} {T.cart_section_items.toLowerCase()}
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
          {items.length === 0 && orderNumber ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="text-5xl">✅</span>
              <div>
                <p className="text-lg font-black text-white">Order Placed!</p>
                <p className="mt-1 text-sm text-slate-400">Your order <span className="font-bold text-[#1AABBD]">{orderNumber}</span> is being processed</p>
              </div>
              <a
                href={`/track/${orderNumber}`}
                onClick={closeCart}
                className="rounded-2xl bg-[#1AABBD] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#168fa0]"
              >
                Track Your Order →
              </a>
              <button onClick={() => setOrderNumber(null)} className="text-xs text-slate-600 hover:text-slate-400">
                Close
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="text-5xl">🛒</span>
              <p className="text-lg font-semibold text-slate-300">{T.cart_empty}</p>
              <p className="text-sm text-slate-500">{T.cart_empty_sub}</p>
            </div>
          ) : (
            <div className="space-y-5 px-6 py-5">

              {/* ── Estimated time + cash on delivery ── */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  {lang === "ar" ? "٢٥–٣٥ دقيقة" : "25–35 min"}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  💵 {lang === "ar" ? "دفع عند الاستلام" : "Cash on delivery"}
                </div>
              </div>

              {/* ── Order Items ── */}
              <div>
                <p className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
                  {T.cart_section_items}
                </p>
                <div className="space-y-4">
                  {Object.entries(
                    items.reduce<Record<string, typeof items>>((acc, item) => {
                      if (!acc[item.restaurantName]) acc[item.restaurantName] = [];
                      acc[item.restaurantName].push(item);
                      return acc;
                    }, {}),
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
                              <p className="truncate text-sm font-medium text-white">{item.name}</p>
                              <p className="text-xs text-slate-400">
                                {item.price !== null ? `$${item.price} ${T.cart_each}` : "LBP price"}
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
                            <p className="text-right text-sm font-bold text-white">
                              {item.price !== null
                                ? `$${(item.price * item.quantity).toFixed(2)}`
                                : item.priceLbp !== null
                                  ? `${((item.priceLbp * item.quantity) / 1_000_000).toFixed(2)}M LBP`
                                  : "—"}
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
                  {T.cart_section_delivery}
                </p>
                <div className="space-y-3">

                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      {T.cart_name} <span className="text-[#1AABBD]">*</span>
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => { setCustomer((p) => ({ ...p, name: e.target.value })); if (errors.name) setErrors((p) => ({ ...p, name: false })); }}
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:bg-white/10 ${errors.name ? "border-red-500" : "border-white/10 focus:border-[#1AABBD]"}`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{T.cart_err_name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.76h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 5.69 5.69l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.22 17l-.3-.08z"/>
                      </svg>
                      {T.cart_phone} <span className="text-[#1AABBD]">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-300 select-none">+961</div>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 8); setCustomer((p) => ({ ...p, phone: v })); if (errors.phone) setErrors((p) => ({ ...p, phone: false })); }}
                        className={`flex-1 rounded-xl border bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:bg-white/10 ${errors.phone ? "border-red-500" : "border-white/10 focus:border-[#1AABBD]"}`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-400">{T.cart_err_phone}</p>}
                  </div>

                  {/* Zone picker */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                      </svg>
                      {T.cart_area} <span className="text-[#1AABBD]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DELIVERY_ZONES.map((zone) => (
                        <button
                          key={zone.label}
                          type="button"
                          onClick={() => setCustomer((p) => ({ ...p, zone: zone.label }))}
                          className={`flex flex-col items-center rounded-xl border py-3 text-sm font-semibold transition ${
                            customer.zone === zone.label
                              ? "border-[#1AABBD] bg-[#1AABBD]/10 text-white"
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                          }`}
                        >
                          {zone.label}
                          <span className={`mt-0.5 text-xs font-bold ${customer.zone === zone.label ? "text-[#F9B233]" : "text-slate-600"}`}>
                            +${zone.fee}.00
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {T.cart_address} <span className="text-[#1AABBD]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "الشارع، المبنى، بالقرب من..." : "Street, building, near landmark…"}
                      value={customer.location}
                      onChange={(e) => { setCustomer((p) => ({ ...p, location: e.target.value })); if (errors.location) setErrors((p) => ({ ...p, location: false })); }}
                      className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:bg-white/10 ${errors.location ? "border-red-500" : "border-white/10 focus:border-[#1AABBD]"}`}
                    />
                    {errors.location && <p className="mt-1 text-xs text-red-400">{T.cart_err_address}</p>}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                      </svg>
                      {T.cart_notes} <span className="ml-1 font-normal text-slate-500">{T.cart_optional}</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder={lang === "ar" ? "أي طلبات خاصة؟" : "Any special requests?"}
                      value={customer.notes}
                      onChange={(e) => setCustomer((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#1AABBD] focus:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* ── Price Summary ── */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                {subtotal > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>{T.cart_subtotal} (USD)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                )}
                {subtotalLbp > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>{T.cart_subtotal} (LBP)</span>
                    <span>
                      {subtotalLbp >= 1_000_000
                        ? `${(subtotalLbp / 1_000_000).toFixed(2)}M LBP`
                        : `${subtotalLbp.toLocaleString()} LBP`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>{T.cart_delivery} ({customer.zone})</span>
                  <span>+${deliveryFee}.00</span>
                </div>
                <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                  {subtotal > 0 && (
                    <div className="flex justify-between text-lg font-black text-white">
                      <span>{T.cart_total}</span>
                      <span className="text-[#F9B233]">${total.toFixed(2)}</span>
                    </div>
                  )}
                  {subtotalLbp > 0 && (
                    <div className="flex justify-between text-base font-black text-white">
                      {subtotal === 0 && <span>{T.cart_total}</span>}
                      {subtotal > 0 && <span className="text-sm text-slate-400">+ LBP items</span>}
                      <span className="text-[#F9B233]">
                        {subtotalLbp >= 1_000_000
                          ? `${(subtotalLbp / 1_000_000).toFixed(2)}M LBP`
                          : `${subtotalLbp.toLocaleString()} LBP`}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs text-slate-500 pt-1">
                  💵 {lang === "ar" ? "الدفع عند الاستلام" : "Cash on delivery"}
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-3">
            {!user && (
              <div className="rounded-xl bg-[#F9B233]/10 border border-[#F9B233]/30 px-4 py-2.5 text-center">
                <p className="text-xs font-semibold text-[#F9B233]">
                  {lang === "ar" ? "يجب تسجيل الدخول للطلب" : "You must be signed in to order"}
                </p>
                <a href="/auth/login" onClick={closeCart} className="mt-1 block text-xs text-white underline">
                  {lang === "ar" ? "تسجيل الدخول ←" : "Sign in →"}
                </a>
              </div>
            )}
            {user && (
              <p className="text-center text-xs text-slate-500">
                {lang === "ar"
                  ? "سيتم تحويلك إلى واتساب لإتمام طلبك"
                  : "You will be redirected to WhatsApp to confirm your order"}
              </p>
            )}
            <button
              onClick={handleOrderClick}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/20 transition hover:bg-[#1ebe5c] active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  {lang === "ar" ? "جارٍ المعالجة..." : "Processing..."}
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {lang === "ar" ? "اطلب الآن 🚀" : "Order Now 🚀"}
                </>
              )}
            </button>
            <button onClick={handleClear} className="w-full text-center text-xs text-slate-600 transition hover:text-slate-400">
              {T.cart_clear}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
