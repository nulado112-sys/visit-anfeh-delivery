"use client";

import { useEffect, useState } from "react";
import { supabase, STATUS_LABELS, type Order, type OrderStatus } from "../lib/supabase";
import Link from "next/link";

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "anfeh2024";
const STATUSES: OrderStatus[] = ["pending", "preparing", "out_for_delivery", "delivered"];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
};

const NEXT_LABEL: Record<OrderStatus, string> = {
  pending: "Start Preparing 👨‍🍳",
  preparing: "Out for Delivery 🛵",
  out_for_delivery: "Mark Delivered ✅",
  delivered: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchOrders();

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  async function updateStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order.id);
    await supabase.from("orders").update({ status: next }).eq("id", order.id);
    setUpdating(null);
  }

  async function assignDriver(order: Order) {
    const name = driverName[order.id];
    if (!name?.trim()) return;
    await supabase.from("orders").update({ driver_name: name.trim(), status: "out_for_delivery" }).eq("id", order.id);
    setDriverName(p => ({ ...p, [order.id]: "" }));
  }

  async function deleteOrder(order: Order) {
    if (!confirm(`Delete order ${order.order_number}?`)) return;
    await supabase.from("orders").delete().eq("id", order.id);
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem("admin_authed", "1");
      setAuthed(true);
    } else {
      alert("Wrong password");
    }
  }

  if (!authed) return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C2B35] px-5">
      <form onSubmit={login} className="w-full max-w-xs space-y-4">
        <h1 className="text-center text-2xl font-black text-white">Admin Access</h1>
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#1AABBD]"
        />
        <button type="submit" className="w-full rounded-2xl bg-[#1AABBD] py-3 font-bold text-white">
          Enter
        </button>
      </form>
    </main>
  );

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {} as Record<string, number>);

  return (
    <main className="min-h-screen bg-[#0C2B35] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-black">Visit Anfeh — Admin</h1>
            <p className="text-xs text-slate-400">{orders.length} total orders</p>
          </div>
          <div className="flex gap-2">
            <Link href="/driver" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">Driver View</Link>
            <button onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mx-auto max-w-5xl overflow-x-auto px-5 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${filter === "all" ? "bg-[#1AABBD] text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
          >
            All ({orders.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${filter === s ? "text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
              style={filter === s ? { backgroundColor: STATUS_LABELS[s].color } : undefined}
            >
              {STATUS_LABELS[s].icon} {STATUS_LABELS[s].en} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="mx-auto max-w-5xl px-5 pb-10">
        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1AABBD] border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">No orders</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(order => {
              const s = STATUS_LABELS[order.status];
              const next = NEXT_STATUS[order.status];
              return (
                <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  {/* Order header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-lg px-2.5 py-1 text-xs font-black text-white" style={{ backgroundColor: s.color }}>
                        {s.icon} {s.en}
                      </span>
                      <p className="mt-2 text-lg font-black">{order.order_number}</p>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {new Date(order.created_at).toLocaleDateString("en-GB")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/track/${order.order_number}`} target="_blank" className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs hover:bg-white/20">
                        Track 🔗
                      </Link>
                      <button
                        onClick={() => deleteOrder(order)}
                        className="rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/40"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="mt-3 rounded-xl bg-white/5 p-3 space-y-1 text-sm">
                    <p><span className="text-slate-400">👤</span> {order.customer_name}</p>
                    <p><span className="text-slate-400">📞</span> +961{order.customer_phone}</p>
                    <p><span className="text-slate-400">📍</span> {order.zone} — {order.address}</p>
                    {order.notes && <p><span className="text-slate-400">📝</span> {order.notes}</p>}
                    {order.driver_name && <p><span className="text-slate-400">🛵</span> {order.driver_name}</p>}
                  </div>

                  {/* Items */}
                  <div className="mt-3 space-y-1 text-sm">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-slate-300">
                        <span>{item.name} ×{item.quantity}</span>
                        <span>{item.price !== null ? `$${item.price}` : item.priceLbp ? `${(item.priceLbp / 1_000_000).toFixed(2)}M LBP` : "—"}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-[#F9B233]">
                      <span>Total</span>
                      <span>
                        {order.subtotal > 0 && `$${order.total.toFixed(2)}`}
                        {order.subtotal_lbp > 0 && ` +${(order.subtotal_lbp / 1_000_000).toFixed(2)}M LBP`}
                      </span>
                    </div>
                  </div>

                  {/* Driver assign */}
                  {order.status === "preparing" && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Driver name"
                        value={driverName[order.id] ?? ""}
                        onChange={e => setDriverName(p => ({ ...p, [order.id]: e.target.value }))}
                        className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm outline-none focus:border-[#1AABBD]"
                      />
                      <button
                        onClick={() => assignDriver(order)}
                        className="rounded-xl bg-purple-500 px-3 py-2 text-xs font-bold hover:bg-purple-600"
                      >
                        Assign 🛵
                      </button>
                    </div>
                  )}

                  {/* Action button */}
                  {next && (
                    <button
                      onClick={() => updateStatus(order)}
                      disabled={updating === order.id}
                      className="mt-3 w-full rounded-2xl py-3 text-sm font-bold text-white transition disabled:opacity-60"
                      style={{ backgroundColor: STATUS_LABELS[next].color }}
                    >
                      {updating === order.id ? "Updating..." : NEXT_LABEL[order.status]}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
