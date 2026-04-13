"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(next);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4FAFB] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logos/visit-anfeh-delivery-logo.jpg" alt="Visit Anfeh Delivery" width={72} height={72} className="rounded-2xl shadow-md" />
          <h1 className="mt-4 text-2xl font-black text-[#0C2B35]">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to track your orders</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15"
            />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#1AABBD] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1AABBD]/25 transition hover:bg-[#168fa0] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href="/auth/signup" className="font-bold text-[#1AABBD] hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Back to restaurants
          </Link>
        </p>
      </div>
    </main>
  );
}
