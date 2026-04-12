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
    <main>
      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="bg-[#FFF8F0] px-5 pt-14 pb-10">
        <div className="mx-auto max-w-3xl text-center">

          {/* Eyebrow badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#1AABBD]/10 px-4 py-1.5 text-xs font-bold tracking-widest text-[#1AABBD] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F9B233] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F9B233]" />
            </span>
            Now delivering · Anfeh, North Lebanon
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-[#0C2B35] md:text-6xl lg:text-7xl">
            What do you{" "}
            <span className="text-[#1AABBD]">have a</span>
            <br />
            <span className="relative inline-block">
              taste for?
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                <path d="M2 6 C75 2, 150 2, 298 6" stroke="#F9B233" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-500">
            {restaurants.length} restaurants · {totalItems}+ menu items. Browse,
            add to cart, and order via WhatsApp in seconds.
          </p>

          <a
            href="#restaurants"
            className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-[#1AABBD] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#1AABBD]/20 transition-all hover:bg-[#168fa0] hover:-translate-y-0.5 active:scale-95"
          >
            Explore Restaurants
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section className="border-y border-[#1AABBD]/10 bg-white px-5 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { icon: "🍽️", step: "01", title: "Browse Menus", desc: "Find any restaurant by name or scroll all Anfeh spots." },
              { icon: "🛒", step: "02", title: "Add to Cart", desc: "Tap + on any item. Build your order from multiple restaurants." },
              { icon: "💬", step: "03", title: "Order via WhatsApp", desc: "Enter your details, press the button — we receive it instantly." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 px-6 py-6 first:pl-0 last:pr-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF8F0] text-xl">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-black tracking-widest text-[#1AABBD] uppercase">Step {s.step}</p>
                  <p className="mt-0.5 font-extrabold text-[#0C2B35]">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          RESTAURANT GRID
      ══════════════════════════════ */}
      <RestaurantGrid restaurants={restaurants as Parameters<typeof RestaurantGrid>[0]["restaurants"]} />
    </main>
  );
}
