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
    <section id="restaurants" className="px-5 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header + search */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black tracking-tight text-[#0C2B35]">
            Restaurants
          </h2>

          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1AABBD]"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search a restaurant…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#1AABBD]/20 bg-white py-2.5 pl-10 pr-10 text-sm text-[#0C2B35] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1AABBD] focus:ring-2 focus:ring-[#1AABBD]/15"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1AABBD]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-4xl">🔍</span>
            <p className="font-bold text-slate-500">No restaurants found</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => {
            const itemCount = countItems(restaurant);

            return (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#1AABBD]/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1AABBD]/40 hover:shadow-lg hover:shadow-[#1AABBD]/10"
              >
                {/* Logo area — one clean teal tint */}
                <div className="relative flex h-44 items-center justify-center bg-[#EBF8FA]">
                  {restaurant.logo ? (
                    <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-white shadow-sm">
                      <LogoImage
                        src={`/logos/${restaurant.logo}`}
                        alt={restaurant.name}
                        fill
                        fallback={restaurant.name[0]}
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#1AABBD] text-3xl font-black text-white">
                      {restaurant.name[0]}
                    </div>
                  )}

                  <div className="absolute top-3 right-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#1AABBD] shadow-sm border border-[#1AABBD]/15">
                    {itemCount} items
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-extrabold leading-tight text-[#0C2B35] transition-colors group-hover:text-[#1AABBD]">
                    {restaurant.name}
                  </h3>
                  {restaurant.name_ar && (
                    <p className="mt-0.5 text-sm text-slate-400">{restaurant.name_ar}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Open now · {(restaurant.categories ?? []).length} categories
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between border-t border-[#1AABBD]/10 px-5 py-3.5">
                  <span className="text-sm font-bold text-[#1AABBD]">View Menu</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1AABBD] text-white transition-all group-hover:bg-[#0C2B35] group-hover:translate-x-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
