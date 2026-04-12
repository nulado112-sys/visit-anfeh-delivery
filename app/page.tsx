import data from "./data/restaurants.json";
import RestaurantGrid from "./components/RestaurantGrid";

export default function Home() {
  const restaurants = data.restaurants;

  const totalItems = restaurants.reduce(
    (s, r) =>
      s + (r.categories ?? []).reduce((cs, c) => cs + (c.items?.length ?? 0), 0),
    0,
  );

  return (
    <main className="bg-[#F4FAFB]">
      {/* HERO */}
      <section className="px-5 pt-16 pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1AABBD]/20 bg-white px-4 py-1.5 text-xs font-semibold tracking-widest text-[#1AABBD] uppercase shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1AABBD] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1AABBD]" />
            </span>
            Anfeh · North Lebanon
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-[#0C2B35] md:text-6xl">
            What do you have
            <br />
            <span className="text-[#1AABBD]">a taste for?</span>
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-base text-slate-500">
            {restaurants.length} restaurants &amp; {totalItems}+ items.
            Order via WhatsApp in seconds.
          </p>

          <a
            href="#restaurants"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#1AABBD] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#1AABBD]/25 transition hover:bg-[#168fa0] hover:-translate-y-0.5 active:scale-95"
          >
            Browse Restaurants
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-4xl px-5 pb-6">
        <div className="grid grid-cols-1 divide-y divide-[#1AABBD]/10 rounded-3xl border border-[#1AABBD]/15 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: "🍽️", title: "Browse", desc: "Pick any restaurant and explore their full menu." },
            { icon: "🛒", title: "Add to Cart", desc: "Tap + on items to build your order." },
            { icon: "💬", title: "Order on WhatsApp", desc: "Fill in your details and send in one tap." },
          ].map((s) => (
            <div key={s.title} className="flex items-start gap-3.5 px-6 py-5">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="font-bold text-[#0C2B35]">{s.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GRID */}
      <RestaurantGrid restaurants={restaurants as Parameters<typeof RestaurantGrid>[0]["restaurants"]} />
    </main>
  );
}
