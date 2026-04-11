"use client";

import { useState } from "react";
import Link from "next/link";
import LogoImage from "./LogoImage";

type Restaurant = {
  id: string;
  name: string;
  name_ar?: string;
  logo?: string;
  phone?: string;
  categories?: { items?: unknown[] }[];
  [key: string]: unknown;
};

const CARD_COVERS = [
  "from-[#0C2B35] via-[#1AABBD]/40 to-[#0C2B35]",
  "from-[#1a3a5c] via-[#2b6cb0]/40 to-[#1a3a5c]",
  "from-[#2d1b69] via-[#7c3aed]/30 to-[#2d1b69]",
  "from-[#1a1a2e] via-[#e94560]/20 to-[#1a1a2e]",
  "from-[#0d3b2e] via-[#10b981]/30 to-[#0d3b2e]",
  "from-[#1c1917] via-[#d97706]/30 to-[#1c1917]",
  "from-[#1e1b4b] via-[#6366f1]/30 to-[#1e1b4b]",
  "from-[#1a0a00] via-[#ea580c]/30 to-[#1a0a00]",
  "from-[#0c1a2b] via-[#0ea5e9]/30 to-[#0c1a2b]",
];

export default function RestaurantGrid({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const [query, setQuery] = useState("");

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()),
  );

  function countItems(r: Restaurant) {
    return (r.categories ?? []).reduce(
      (s, c) => s + (c.items?.length ?? 0),
      0,
    );
  }

  return (
    <section id="restaurants" className="px-5 py-16">
      <div className="mx-auto max-w-7xl">

        {/* Section header + search */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#1AABBD] uppercase">
              Where to eat
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0C2B35]">
              All Restaurants
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search restaurants…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-5xl">🔍</span>
            <p className="text-lg font-bold text-slate-600">No restaurants found</p>
            <p className="text-sm text-slate-400">Try a different name</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant, idx) => {
            const itemCount = countItems(restaurant);
            const coverGradient = CARD_COVERS[idx % CARD_COVERS.length];

            return (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#1AABBD]/10 hover:border-[#1AABBD]/30"
              >
                {/* ── Cover ── */}
                <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${coverGradient}`}>
                  {/* Subtle dot pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, white 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Logo centered with white card */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="relative h-full w-full max-h-28 max-w-[180px] overflow-hidden rounded-xl bg-white/95 shadow-lg backdrop-blur-sm">
                      {restaurant.logo ? (
                        <LogoImage
                          src={`/logos/${restaurant.logo}`}
                          alt={restaurant.name}
                          fill
                          fallback={restaurant.name[0]}
                          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl font-black text-[#1AABBD]">
                          {restaurant.name[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Index badge */}
                  <div className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/30 text-xs font-black text-white backdrop-blur-sm">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* Item count pill */}
                  <div className="absolute top-3 right-3 rounded-full bg-[#F9B233] px-2.5 py-1 text-xs font-black text-[#0C2B35]">
                    {itemCount} items
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold leading-tight tracking-tight text-[#0C2B35] transition-colors group-hover:text-[#1AABBD]">
                    {restaurant.name}
                  </h3>
                  {restaurant.name_ar && (
                    <p className="mt-0.5 text-sm text-slate-400">
                      {restaurant.name_ar}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Open now
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2 py-1">
                      📋 {(restaurant.categories ?? []).length} categories
                    </span>
                    {restaurant.phone && (
                      <span className="rounded-lg bg-slate-50 px-2 py-1">
                        📞 {String(restaurant.phone)}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── CTA ── */}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                  <span className="text-sm font-bold text-[#1AABBD]">View Menu</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1AABBD] text-white shadow-sm transition-all group-hover:translate-x-0.5 group-hover:bg-[#0C2B35]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
