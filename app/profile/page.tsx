"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Order } from "../lib/supabase";
import { STATUS_LABELS } from "../lib/supabase";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setFetching(false);
      });
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4FAFB]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1AABBD] border-t-transparent" />
    </main>
  );

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F4FAFB]">
      {/* Header */}
      <div className="border-b border-[#1AABBD]/15 bg-white px-5 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="font-bold text-[#0C2B35]">{user.user_metadata?.full_name || user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-xl border border-[#1AABBD]/20 px-4 py-2 text-sm font-semibold text-[#0C2B35] transition hover:bg-[#EBF8FA]">
              ← Home
            </Link>
            <button onClick={handleLogout} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-8">
        <h1 className="mb-6 text-2xl font-black text-[#0C2B35]">My Orders</h1>

        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1AABBD] border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-5xl">📦</span>
            <p className="font-bold text-slate-500">No orders yet</p>
            <Link href="/" className="mt-2 rounded-xl bg-[#1AABBD] px-6 py-2.5 text-sm font-bold text-white">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const s = STATUS_LABELS[order.status];
              return (
                <div key={order.id} className="rounded-3xl border border-[#1AABBD]/15 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="mt-0.5 text-lg font-black text-[#0C2B35]">{order.order_number}</p>
                      <p className="text-sm text-slate-500">{order.items.length} items · {order.zone}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: s.color }}>
                      {s.icon} {s.en}
                    </span>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-[#0C2B35]">
                      {order.subtotal > 0 && `$${order.total.toFixed(2)}`}
                      {order.subtotal_lbp > 0 && order.subtotal > 0 && " + "}
                      {order.subtotal_lbp > 0 && `${(order.subtotal_lbp / 1_000_000).toFixed(2)}M LBP`}
                    </p>
                    <Link
                      href={`/track/${order.order_number}`}
                      className="rounded-xl bg-[#1AABBD]/10 px-4 py-1.5 text-xs font-bold text-[#1AABBD] transition hover:bg-[#1AABBD]/20"
                    >
                      Track Order →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
