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
  categories?: { name?: string; items?: unknown[] }[];
  [key: string]: unknown;
};

// Soft warm accent backgrounds for logo area — no dark gradients
const LOGO_BG = [
  "#EBF8FA", // teal tint
  "#FFF3E0", // warm amber
  "#F0FDF4", // soft green
  "#FFF1F2", // soft rose
  "#F5F3FF", // soft violet
  "#ECFEFF", // cyan
  "#FFFBEB", // amber
  "#F0F9FF", // sky
  "#FDF4FF", // purple
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
    return (r.categories ?? []).reduce((s, c) => s + (c.items?.length ?? 0), 0);
  }

  return (
    <section id="restaurants" className="px-5 py-14">
      <div className="mx-auto max-w-7xl">

        {/* Header + search */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#1AABBD] uppercase">Where to eat</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0C2B35]">
              Restaurants Near You
            </h2>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search a restaurant…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant, idx) => {
            const itemCount = countItems(restaurant);
            const logoBg = LOGO_BG[idx % LOGO_BG.length];

            return (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1AABBD]/10 hover:border-[#1AABBD]/20"
              >
                {/* Logo area */}
                <div
                  className="relative flex h-44 items-center justify-center overflow-hidden"
                  style={{ backgroundColor: logoBg }}
                >
                  {restaurant.logo ? (
                    <div className="relative h-28 w-28 overflow-hidden rounded-2xl shadow-md">
                      <LogoImage
                        src={`/logos/${restaurant.logo}`}
                        alt={restaurant.name}
                        fill
                        fallback={restaurant.name[0]}
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black text-white"
                      style={{ backgroundColor: "#1AABBD" }}
                    >
                      {restaurant.name[0]}
                    </div>
                  )}

                  {/* Item count badge */}
                  <div className="absolute top-3 right-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#0C2B35] shadow-sm">
                    {itemCount} items
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold leading-tight tracking-tight text-[#0C2B35] transition-colors group-hover:text-[#1AABBD]">
                    {restaurant.name}
                  </h3>
                  {restaurant.name_ar && (
                    <p className="mt-0.5 text-sm text-slate-400">{restaurant.name_ar}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Open now
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2.5 py-1">
                      {(restaurant.categories ?? []).length} categories
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                  <span className="text-sm font-bold text-[#1AABBD]">View Menu</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1AABBD] text-white shadow-sm transition-all group-hover:bg-[#0C2B35] group-hover:translate-x-0.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
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
