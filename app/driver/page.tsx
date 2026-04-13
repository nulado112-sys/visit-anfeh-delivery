"use client";

import { useEffect, useState, useRef } from "react";
import { supabase, STATUS_LABELS, type Order } from "../lib/supabase";

const DRIVER_PASS = process.env.NEXT_PUBLIC_DRIVER_PASS || "driver2024";

export default function DriverPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [driverName, setDriverName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const prevOrderCount = useRef(0);
  const watchRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (localStorage.getItem("driver_authed") === "1") {
      setAuthed(true);
      const saved = localStorage.getItem("driver_name");
      if (saved) { setDriverName(saved); setNameSet(true); }
    }
  }, []);

  useEffect(() => {
    if (!authed || !nameSet) return;
    fetchOrders();

    const channel = supabase
      .channel("driver-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();

    // Ping presence every 30s so admin sees driver as online
    pingPresence();
    pingRef.current = setInterval(pingPresence, 30000);

    return () => {
      supabase.removeChannel(channel);
      stopSharing();
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, [authed, nameSet]);

  async function pingPresence() {
    const name = driverName || sessionStorage.getItem("driver_name") || "";
    if (!name) return;
    await supabase.from("drivers").upsert(
      { name, active: true, last_seen: new Date().toISOString() },
      { onConflict: "name" }
    );
  }

  async function fetchOrders() {
    const name = driverName || sessionStorage.getItem("driver_name") || "";
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("driver_name", name)
      .eq("status", "out_for_delivery")
      .order("created_at", { ascending: false });
    const fetched = (data as Order[]) ?? [];

    // Alert driver if a new order just appeared
    if (prevOrderCount.current > 0 && fetched.length > prevOrderCount.current) {
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 6000);
    }
    prevOrderCount.current = fetched.length;

    setOrders(fetched);
    setLoading(false);
  }

  function startSharing() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by this browser.");
      return;
    }
    setLocationError("");
    setSharing(true);

    let lastLat: number | null = null;
    let lastLng: number | null = null;

    const sendLocation = async (lat: number, lng: number) => {
      lastLat = lat;
      lastLng = lng;
      await supabase
        .from("orders")
        .update({ driver_lat: lat, driver_lng: lng, driver_updated_at: new Date().toISOString() })
        .eq("driver_name", driverName)
        .eq("status", "out_for_delivery");
    };

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLocationError("Location access denied. Please allow location in browser settings.");
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );

    intervalRef.current = setInterval(() => {
      if (lastLat && lastLng) sendLocation(lastLat, lastLng);
    }, 5000);
  }

  function stopSharing() {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSharing(false);
  }

  async function markDelivered(order: Order) {
    setUpdating(order.id);
    await supabase
      .from("orders")
      .update({ status: "delivered", driver_lat: null, driver_lng: null })
      .eq("id", order.id);
    setUpdating(null);
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pass === DRIVER_PASS) {
      localStorage.setItem("driver_authed", "1");
      setAuthed(true);
    } else {
      alert("Wrong password");
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!driverName.trim()) return;
    const trimmed = driverName.trim();
    localStorage.setItem("driver_name", trimmed);
    setDriverName(trimmed);
    // Register as active driver immediately
    await supabase.from("drivers").upsert(
      { name: trimmed, active: true, last_seen: new Date().toISOString() },
      { onConflict: "name" }
    );
    setNameSet(true);
  }

  async function endShift() {
    const name = driverName || sessionStorage.getItem("driver_name") || "";
    if (name) {
      await supabase.from("drivers").update({ active: false }).eq("name", name);
    }
    stopSharing();
    if (pingRef.current) clearInterval(pingRef.current);
    localStorage.removeItem("driver_authed");
    localStorage.removeItem("driver_name");
    setAuthed(false);
    setNameSet(false);
  }

  if (!authed) return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C2B35] px-5">
      <form onSubmit={login} className="w-full max-w-xs space-y-4">
        <div className="text-center">
          <span className="text-5xl">🛵</span>
          <h1 className="mt-3 text-2xl font-black text-white">Driver Access</h1>
          <p className="mt-1 text-sm text-slate-400">Visit Anfeh Delivery</p>
        </div>
        <input
          type="password"
          placeholder="Driver password"
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

  if (!nameSet) return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C2B35] px-5">
      <form onSubmit={saveName} className="w-full max-w-xs space-y-4">
        <div className="text-center">
          <span className="text-5xl">👤</span>
          <h1 className="mt-3 text-2xl font-black text-white">Your Name</h1>
          <p className="mt-1 text-sm text-slate-400">So the admin knows you're online</p>
        </div>
        <input
          type="text"
          placeholder="e.g. Ahmad"
          value={driverName}
          onChange={e => setDriverName(e.target.value)}
          className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#1AABBD]"
        />
        <button type="submit" className="w-full rounded-2xl bg-[#1AABBD] py-3 font-bold text-white">
          Start Shift
        </button>
      </form>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0C2B35] text-white">
      {/* New order alert banner */}
      {newOrderAlert && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-green-500 px-5 py-3 text-sm font-bold text-white animate-pulse">
          🔔 New order assigned to you!
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <h1 className="font-black text-lg">🛵 {driverName}</h1>
            <p className="text-xs text-slate-400">{orders.length} active {orders.length === 1 ? "delivery" : "deliveries"}</p>
          </div>
          <button
            onClick={endShift}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
          >
            End Shift
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 py-6 space-y-5">

        {/* GPS Share toggle */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm">Live GPS Sharing</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {sharing ? "Your location is visible to admin" : "Admin cannot see your location"}
              </p>
            </div>
            <button
              onClick={sharing ? stopSharing : startSharing}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${sharing ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
            >
              {sharing ? "Stop 🔴" : "Share 🟢"}
            </button>
          </div>
          {sharing && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
              <span className="h-2 w-2 animate-ping rounded-full bg-green-400" />
              Sharing live location...
            </div>
          )}
          {locationError && (
            <p className="mt-2 rounded-xl bg-red-500/20 px-3 py-2 text-xs text-red-300">{locationError}</p>
          )}
        </div>

        {/* Active deliveries */}
        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">Active Deliveries</p>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#1AABBD] border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-slate-400 text-sm">No active deliveries assigned to you</p>
              <p className="text-slate-600 text-xs mt-1">The admin will assign you an order when ready</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const s = STATUS_LABELS[order.status];
                return (
                  <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black">{order.order_number}</p>
                      <span className="rounded-lg px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: s.color }}>
                        {s.icon} {s.en}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3 space-y-1 text-sm">
                      <p><span className="text-slate-400">👤</span> {order.customer_name}</p>
                      <p><span className="text-slate-400">📞</span> <a href={`tel:+961${order.customer_phone}`} className="text-[#1AABBD] underline">+961{order.customer_phone}</a></p>
                      <p><span className="text-slate-400">📍</span> {order.zone} — {order.address}</p>
                      {order.notes && <p><span className="text-slate-400">📝</span> {order.notes}</p>}
                    </div>

                    <div className="space-y-1 text-sm">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-slate-300">
                          <span>{item.name} ×{item.quantity}</span>
                          <span>{item.price !== null ? `$${item.price}` : item.priceLbp ? `${(item.priceLbp / 1_000_000).toFixed(2)}M LBP` : "—"}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-[#F9B233] text-sm">
                        <span>Collect</span>
                        <span>
                          {order.subtotal > 0 && `$${order.total.toFixed(2)}`}
                          {order.subtotal_lbp > 0 && ` +${(order.subtotal_lbp / 1_000_000).toFixed(2)}M LBP`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => markDelivered(order)}
                      disabled={updating === order.id}
                      className="w-full rounded-2xl bg-green-500 py-3 text-sm font-bold text-white transition hover:bg-green-600 disabled:opacity-60"
                    >
                      {updating === order.id ? "Updating..." : "Mark as Delivered ✅"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
