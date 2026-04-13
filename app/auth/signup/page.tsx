"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";

// Phone numbers are stored as phone@ph.visitanfeh (no SMS cost)
function phoneToEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@ph.visitanfeh`;
}

export default function SignupPage() {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchTab(t: "email" | "phone") {
    setTab(t);
    setError("");
    setEmail("");
    setPhone("");
    setPassword("");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");

    const identifier = tab === "phone" ? phoneToEmail(phone) : email.trim();

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Always sign in immediately after signup — no need to re-enter credentials
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (loginData.session) {
        window.location.replace("/");
      } else {
        setError(loginError?.message || "Account created! Please sign in.");
        setLoading(false);
      }
    } catch {
      setError("Connection error. Check your internet and try again.");
      setLoading(false);
    }
  }

  const canSubmit = name && password && (tab === "email" ? email : phone.replace(/\D/g, "").length >= 7);

  return (
    <main className="min-h-screen bg-[#F4FAFB] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logos/visit-anfeh-delivery-logo.jpg"
            alt="Visit Anfeh Delivery"
            width={72}
            height={72}
            className="rounded-2xl shadow-md"
          />
          <h1 className="mt-4 text-2xl font-black text-[#0C2B35]">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Track your orders in real time</p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex rounded-2xl border border-[#1AABBD]/20 bg-white p-1">
          <button
            type="button"
            onClick={() => switchTab("email")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${tab === "email" ? "bg-[#1AABBD] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            ✉️ Email
          </button>
          <button
            type="button"
            onClick={() => switchTab("phone")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${tab === "phone" ? "bg-[#1AABBD] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            📱 Phone
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15 disabled:opacity-60"
            />
          </div>

          {tab === "email" ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
              <input
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                inputMode="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15 disabled:opacity-60"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center rounded-2xl border border-[#1AABBD]/20 bg-white px-3 py-3 text-sm font-semibold text-[#0C2B35]">
                  🇱🇧 +961
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="70 123 456"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15 disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-slate-400">At least 6 characters</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <span className="mt-0.5">⚠️</span>
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-2xl bg-[#1AABBD] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1AABBD]/25 transition hover:bg-[#168fa0] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-[#1AABBD] hover:underline">
            Sign in
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
