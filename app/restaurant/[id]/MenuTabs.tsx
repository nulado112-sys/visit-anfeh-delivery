"use client";

import { useState } from "react";
import { useCart } from "../../context/cart";
import { showToast } from "../../components/Toast";

type Item = {
  name: string;
  description?: string;
  price?: number;
  price_lbp?: number;
  is_new?: boolean;
  note?: string;
};

type Category = {
  name: string;
  note?: string;
  items?: Item[];
  add_ons?: { name: string; price?: number }[];
};

type Props = {
  restaurantId: string;
  restaurantName: string;
  categories: Category[];
  currencyNote: string;
};

function formatPrice(item: Item): string {
  if (item.price !== undefined) return `$${item.price}`;
  if (item.price_lbp !== undefined) {
    return item.price_lbp >= 1_000_000
      ? `${(item.price_lbp / 1_000_000).toFixed(2)}M LBP`
      : `${item.price_lbp.toLocaleString()} LBP`;
  }
  return "—";
}

function AddButton({ item, restaurantId, restaurantName }: { item: Item; restaurantId: string; restaurantName: string }) {
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find(i => i.restaurantId === restaurantId && i.name === item.name);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd() {
    addItem({ restaurantId, restaurantName, name: item.name, price: item.price ?? null, priceLbp: item.price_lbp ?? null });
    showToast(item.name);
  }

  if (qty === 0) {
    return (
      <button
        onClick={handleAdd}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1AABBD] text-white shadow-sm transition hover:bg-[#168fa0] hover:scale-110 active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[#0C2B35] px-1 py-1">
      <button
        onClick={() => updateQty(restaurantId, item.name, qty - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14"/>
        </svg>
      </button>
      <span className="w-5 text-center text-xs font-bold text-white">{qty}</span>
      <button
        onClick={() => updateQty(restaurantId, item.name, qty + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1AABBD] text-white transition hover:bg-[#168fa0]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
}

export default function MenuTabs({ restaurantId, restaurantName, categories, currencyNote }: Props) {
  const validCategories = categories.filter(c => c.items && c.items.length > 0);
  const [active, setActive] = useState(validCategories[0]?.name ?? "");
  const activeCategory = categories.find(c => c.name === active);

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1AABBD]/15 bg-white p-12 text-center">
        <p className="text-slate-400">Menu coming soon.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Sticky sidebar — desktop */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-24">
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">Menu</p>
          <nav className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActive(cat.name)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm transition-all ${
                  active === cat.name
                    ? "bg-[#1AABBD] font-bold text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#EBF8FA] hover:text-[#0C2B35]"
                }`}
              >
                <span className="block truncate">{cat.name}</span>
                {cat.items && cat.items.length > 0 && (
                  <span className={`text-xs ${active === cat.name ? "text-white/70" : "text-slate-400"}`}>
                    {cat.items.length} items
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActive(cat.name)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active === cat.name
                  ? "bg-[#1AABBD] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-[#EBF8FA] hover:text-[#1AABBD]"
              }`}
            >
              {cat.name}
              {cat.items && cat.items.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({cat.items.length})</span>
              )}
            </button>
          ))}
        </div>

        <p className="mb-5 text-xs italic text-slate-400">{currencyNote}</p>

        {activeCategory && (
          <>
            <div className="mb-5">
              <h2 className="text-2xl font-black tracking-tight text-[#0C2B35]">{activeCategory.name}</h2>
              {activeCategory.note && (
                <p className="mt-1 text-sm italic text-slate-500">{activeCategory.note}</p>
              )}
            </div>

            {activeCategory.items && activeCategory.items.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {activeCategory.items.map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-4 rounded-2xl border border-[#1AABBD]/10 bg-white p-4 shadow-sm transition hover:border-[#1AABBD]/30 hover:shadow-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold leading-tight text-[#0C2B35]">{item.name}</h4>
                        {item.is_new && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">New</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm leading-relaxed text-slate-500 line-clamp-2">{item.description}</p>
                      )}
                      {item.note && item.note !== "Ask for price" && (
                        <p className="mt-1 text-xs italic text-amber-600">{item.note}</p>
                      )}
                      <p className="mt-2 text-base font-extrabold text-[#1AABBD]">
                        {item.note === "Ask for price" ? (
                          <span className="text-sm font-semibold text-slate-400 italic">Ask for price</span>
                        ) : (
                          formatPrice(item)
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {item.note !== "Ask for price" && (
                        <AddButton item={item} restaurantId={restaurantId} restaurantName={restaurantName} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">No items listed yet.</p>
            )}

            {activeCategory.add_ons && activeCategory.add_ons.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#1AABBD]/20 bg-[#EBF8FA] p-5">
                <p className="mb-3 text-sm font-bold text-[#0C2B35]">Available Add-ons</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {activeCategory.add_ons.map((addon, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm">
                      <span className="text-slate-700">{addon.name}</span>
                      {addon.price !== undefined && (
                        <span className="ml-2 shrink-0 font-bold text-[#1AABBD]">+${addon.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
