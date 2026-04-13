"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timed out. Please try again.")), 12000)
    );

    try {
      const { error } = await Promise.race([
        supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }),
        timeout,
      ]);
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4FAFB] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logos/visit-anfeh-delivery-logo.jpg" alt="Visit Anfeh Delivery" width={72} height={72} className="rounded-2xl shadow-md" />
          <h1 className="mt-4 text-2xl font-black text-[#0C2B35]">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Track your orders in real time</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white px-4 py-3 text-sm text-[#0C2B35] outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15"
            />
          </div>
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-[#1AABBD] hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">← Back to restaurants</Link>
        </p>
      </div>
    </main>
  );
}
