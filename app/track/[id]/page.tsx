"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase, STATUS_LABELS, type Order, type OrderStatus } from "../../lib/supabase";
import Link from "next/link";

const STATUSES: OrderStatus[] = ["pending", "preparing", "out_for_delivery", "delivered"];

export default function TrackPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function fetchOrder() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", id)
      .single();
    if (!data) { setNotFound(true); setLoading(false); return; }
    setOrder(data as Order);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrder();

    // Real-time updates
    const channel = supabase
      .channel("order-track")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `order_number=eq.${id}`,
      }, (payload) => {
        setOrder(payload.new as Order);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4FAFB]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1AABBD] border-t-transparent" />
    </main>
  );

  if (notFound) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F4FAFB] px-5 text-center">
      <span className="text-6xl">🔍</span>
      <h1 className="text-2xl font-black text-[#0C2B35]">Order not found</h1>
      <p className="text-slate-500">Check the tracking number and try again.</p>
      <Link href="/" className="rounded-2xl bg-[#1AABBD] px-6 py-3 text-sm font-bold text-white">Go Home</Link>
    </main>
  );

  if (!order) return null;

  const currentStepIdx = STATUSES.indexOf(order.status);
  const s = STATUS_LABELS[order.status];

  return (
    <main className="min-h-screen bg-[#F4FAFB]">
      {/* Header */}
      <div className="border-b border-[#1AABBD]/15 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[#1AABBD]">← Visit Anfeh</Link>
          <span className="text-xs font-bold text-slate-400">Order {order.order_number}</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 py-8 space-y-5">

        {/* Status banner */}
        <div className="rounded-3xl p-6 text-white text-center shadow-lg" style={{ backgroundColor: s.color }}>
          <p className="text-4xl mb-2">{s.icon}</p>
          <p className="text-xl font-black">{s.en}</p>
          <p className="mt-1 text-sm opacity-80">{s.ar}</p>
          {order.driver_name && order.status === "out_for_delivery" && (
            <p className="mt-3 rounded-2xl bg-white/20 px-4 py-2 text-sm font-semibold">
              🛵 Driver: {order.driver_name}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-3xl border border-[#1AABBD]/15 bg-white p-5">
          <p className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Order Timeline</p>
          <div className="space-y-4">
            {STATUSES.map((status, idx) => {
              const st = STATUS_LABELS[status];
              const done = idx <= currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base transition-all ${
                    done ? "bg-[#1AABBD] shadow-md" : "bg-slate-100"
                  }`}>
                    {done ? <span>✓</span> : <span className="text-slate-300">{idx + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${active ? "text-[#1AABBD]" : done ? "text-[#0C2B35]" : "text-slate-300"}`}>
                      {st.icon} {st.en}
                    </p>
                  </div>
                  {active && (
                    <span className="h-2 w-2 animate-ping rounded-full bg-[#1AABBD]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live map — only when out for delivery */}
        {order.status === "out_for_delivery" && (
          <div className="rounded-3xl border border-[#1AABBD]/15 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="h-2 w-2 animate-ping rounded-full bg-green-400" />
              <p className="text-sm font-bold text-[#0C2B35]">Driver Location — Live</p>
              {order.driver_updated_at && (
                <span className="ml-auto text-xs text-slate-400">
                  Updated {Math.floor((Date.now() - new Date(order.driver_updated_at).getTime()) / 1000)}s ago
                </span>
              )}
            </div>
            {order.driver_lat && order.driver_lng ? (
              <iframe
                key={`${order.driver_lat.toFixed(5)}-${order.driver_lng.toFixed(5)}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.driver_lng - 0.008},${order.driver_lat - 0.008},${order.driver_lng + 0.008},${order.driver_lat + 0.008}&layer=mapnik&marker=${order.driver_lat},${order.driver_lng}`}
                width="100%"
                height="280"
                className="border-0"
                title="Driver location"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-3xl mb-2">🛵</span>
                <p className="text-sm font-semibold text-slate-500">Driver is on the way</p>
                <p className="text-xs text-slate-400 mt-1">Location will appear when driver shares GPS</p>
              </div>
            )}
          </div>
        )}

        {/* Order summary */}
        <div className="rounded-3xl border border-[#1AABBD]/15 bg-white p-5">
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">Your Order</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-700">{item.name} ×{item.quantity}</span>
                <span className="font-semibold text-[#0C2B35]">
                  {item.price !== null
                    ? `$${(item.price * item.quantity).toFixed(2)}`
                    : item.priceLbp !== null
                      ? `${((item.priceLbp * item.quantity) / 1_000_000).toFixed(2)}M LBP`
                      : "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3 space-y-1 text-sm">
            {order.subtotal > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Delivery ({order.zone})</span><span>+${order.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-[#0C2B35] text-base pt-1">
              <span>Total</span>
              <span className="text-[#1AABBD]">
                {order.subtotal > 0 && `$${order.total.toFixed(2)}`}
                {order.subtotal_lbp > 0 && order.subtotal > 0 && " + "}
                {order.subtotal_lbp > 0 && `${(order.subtotal_lbp / 1_000_000).toFixed(2)}M LBP`}
              </span>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-[#F4FAFB] px-4 py-2 text-xs text-slate-500">
            📍 {order.address} · 💵 Cash on delivery
          </div>
        </div>

      </div>
    </main>
  );
}
