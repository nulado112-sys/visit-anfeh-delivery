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

type Driver = { id: string; name: string; active: boolean; last_seen: string; password: string };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<"orders" | "drivers">("orders");

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});

  // Drivers
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverPass, setNewDriverPass] = useState("");
  const [driverSaving, setDriverSaving] = useState(false);
  const [driverError, setDriverError] = useState("");
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    fetchAllDrivers();

    const ordersChannel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();

    const driversChannel = supabase
      .channel("admin-drivers")
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => fetchAllDrivers())
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(driversChannel);
    };
  }, [authed]);

  async function fetchAllDrivers() {
    const { data } = await supabase
      .from("drivers")
      .select("id, name, active, last_seen, password")
      .order("name");
    setAllDrivers((data as Driver[]) ?? []);
  }

  function getOnlineDrivers() {
    const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    return allDrivers.filter(d => d.active && d.last_seen >= cutoff);
  }

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
    const name = selectedDriver[order.id];
    if (!name?.trim()) return;
    await supabase.from("orders").update({ driver_name: name.trim(), status: "out_for_delivery" }).eq("id", order.id);
    setSelectedDriver(p => ({ ...p, [order.id]: "" }));
  }

  async function deleteOrder(order: Order) {
    if (!confirm(`Delete order ${order.order_number}?`)) return;
    await supabase.from("orders").delete().eq("id", order.id);
  }

  async function createDriver(e: React.FormEvent) {
    e.preventDefault();
    setDriverError("");
    if (!newDriverName.trim() || !newDriverPass.trim()) return;
    if (newDriverPass.length < 4) { setDriverError("Password must be at least 4 characters."); return; }
    setDriverSaving(true);
    const { error } = await supabase.from("drivers").insert({
      name: newDriverName.trim(),
      password: newDriverPass.trim(),
      active: false,
      last_seen: new Date(0).toISOString(),
    });
    if (error) {
      setDriverError(error.message.includes("unique") ? "A driver with this name already exists." : error.message);
    } else {
      setNewDriverName("");
      setNewDriverPass("");
    }
    setDriverSaving(false);
  }

  async function deleteDriver(driver: Driver) {
    if (!confirm(`Remove driver "${driver.name}"? They will no longer be able to log in.`)) return;
    await supabase.from("drivers").delete().eq("id", driver.id);
  }

  async function resetDriverPassword(driver: Driver) {
    const newPass = prompt(`New password for ${driver.name}:`);
    if (!newPass || newPass.length < 4) { alert("Password must be at least 4 characters."); return; }
    await supabase.from("drivers").update({ password: newPass.trim() }).eq("id", driver.id);
    alert(`Password updated for ${driver.name}.`);
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
  const onlineDrivers = getOnlineDrivers();

  return (
    <main className="min-h-screen bg-[#0C2B35] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-black">Visit Anfeh — Admin</h1>
            <p className="text-xs text-slate-400">{orders.length} total orders · {onlineDrivers.length} driver{onlineDrivers.length !== 1 ? "s" : ""} online</p>
          </div>
          <div className="flex gap-2">
            <Link href="/driver" className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">Driver View</Link>
            <button onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-5 pt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("orders")}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${tab === "orders" ? "bg-[#1AABBD] text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
          >
            📋 Orders
          </button>
          <button
            onClick={() => setTab("drivers")}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${tab === "drivers" ? "bg-[#1AABBD] text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
          >
            🛵 Drivers {allDrivers.length > 0 && `(${allDrivers.length})`}
          </button>
        </div>
      </div>

      {/* ── DRIVERS TAB ── */}
      {tab === "drivers" && (
        <div className="mx-auto max-w-5xl px-5 py-6 space-y-6">

          {/* Create driver */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-sm font-black">Add New Driver</p>
            <form onSubmit={createDriver} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-400">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmad"
                    value={newDriverName}
                    onChange={e => setNewDriverName(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#1AABBD]"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-400">Password</label>
                  <input
                    type="text"
                    placeholder="e.g. ahmad123"
                    value={newDriverPass}
                    onChange={e => setNewDriverPass(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm outline-none focus:border-[#1AABBD]"
                  />
                </div>
              </div>
              {driverError && <p className="text-xs text-red-400">{driverError}</p>}
              <button
                type="submit"
                disabled={driverSaving || !newDriverName || !newDriverPass}
                className="rounded-xl bg-[#1AABBD] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#168fa0] disabled:opacity-50"
              >
                {driverSaving ? "Saving..." : "Create Driver Account"}
              </button>
            </form>
          </div>

          {/* Driver list */}
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">All Drivers</p>
            {allDrivers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 py-10 text-center text-sm text-slate-500">
                No drivers yet. Create one above.
              </div>
            ) : (
              <div className="space-y-3">
                {allDrivers.map(driver => {
                  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
                  const isOnline = driver.active && driver.last_seen >= cutoff;
                  return (
                    <div key={driver.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${isOnline ? "bg-green-400" : "bg-slate-600"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{driver.name}</p>
                        <p className="text-xs text-slate-500">{isOnline ? "Online now" : "Offline"}</p>
                      </div>
                      {/* Password reveal */}
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="font-mono">
                          {showPass[driver.id] ? driver.password : "••••••"}
                        </span>
                        <button
                          onClick={() => setShowPass(p => ({ ...p, [driver.id]: !p[driver.id] }))}
                          className="ml-1 rounded px-1.5 py-0.5 bg-white/10 text-xs hover:bg-white/20"
                        >
                          {showPass[driver.id] ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => resetDriverPassword(driver)}
                          className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs hover:bg-white/20"
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => deleteDriver(driver)}
                          className="rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/40"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === "orders" && (
        <>
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

                      {/* Live GPS map — admin only */}
                      {order.status === "out_for_delivery" && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300">
                            <span className="h-2 w-2 animate-ping rounded-full bg-green-400" />
                            Driver GPS — Live
                            {order.driver_updated_at && (
                              <span className="ml-auto font-normal text-slate-500">
                                {Math.floor((Date.now() - new Date(order.driver_updated_at).getTime()) / 1000)}s ago
                              </span>
                            )}
                          </div>
                          {order.driver_lat && order.driver_lng ? (
                            <iframe
                              key={`${order.driver_lat.toFixed(5)}-${order.driver_lng.toFixed(5)}`}
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.driver_lng - 0.008},${order.driver_lat - 0.008},${order.driver_lng + 0.008},${order.driver_lat + 0.008}&layer=mapnik&marker=${order.driver_lat},${order.driver_lng}`}
                              width="100%"
                              height="200"
                              className="border-0"
                              title="Driver location"
                            />
                          ) : (
                            <div className="py-6 text-center text-xs text-slate-500">
                              🛵 Waiting for driver to share GPS...
                            </div>
                          )}
                        </div>
                      )}

                      {/* Driver assign */}
                      {order.status === "preparing" && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign Driver</p>
                          {onlineDrivers.length === 0 ? (
                            <p className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-500">
                              No drivers online. Ask a driver to open the driver page and log in.
                            </p>
                          ) : (
                            <div className="flex gap-2">
                              <select
                                value={selectedDriver[order.id] ?? ""}
                                onChange={e => setSelectedDriver(p => ({ ...p, [order.id]: e.target.value }))}
                                className="flex-1 rounded-xl border border-white/20 bg-[#0C2B35] px-3 py-2 text-sm text-white outline-none focus:border-[#1AABBD]"
                              >
                                <option value="">— Pick a driver —</option>
                                {onlineDrivers.map(d => (
                                  <option key={d.name} value={d.name}>
                                    🛵 {d.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => assignDriver(order)}
                                disabled={!selectedDriver[order.id]}
                                className="rounded-xl bg-purple-500 px-3 py-2 text-xs font-bold hover:bg-purple-600 disabled:opacity-40"
                              >
                                Send 🛵
                              </button>
                            </div>
                          )}
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
        </>
      )}
    </main>
  );
}
