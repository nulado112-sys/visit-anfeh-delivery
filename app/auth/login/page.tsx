"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, skip the login page entirely
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace(next);
    });
  }, [next]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Wrong email or password. Please try again."
            : error.message
        );
        setLoading(false);
        return;
      }

      if (data.session) {
        // Hard redirect — guarantees session is picked up fresh on next page
        window.location.replace(next);
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Connection error. Check your internet and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4FAFB] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logos/visit-anfeh-delivery-logo.jpg"
            alt="Visit Anfeh Delivery"
            width={72}
            height={72}
            className="rounded-2xl shadow-md"
          />
          <h1 className="mt-4 text-2xl font-black text-[#0C2B35]">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to place and track orders</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15 disabled:opacity-60"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <span className="mt-0.5 text-red-500">⚠️</span>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-2xl bg-[#1AABBD] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1AABBD]/25 transition hover:bg-[#168fa0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#F4FAFB]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1AABBD] border-t-transparent" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
