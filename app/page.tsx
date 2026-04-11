import data from "./data/restaurants.json";
import RestaurantGrid from "./components/RestaurantGrid";

export default function Home() {
  const restaurants = data.restaurants;

  const totalItems = restaurants.reduce(
    (s, r) =>
      s +
      (r.categories ?? []).reduce(
        (cs, c) => cs + (c.items?.length ?? 0),
        0,
      ),
    0,
  );

  return (
    <main>
      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0C2B35]">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[#1AABBD]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#F9B233]/8 blur-[100px]" />
        </div>

        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">

            {/* Left — text */}
            <div className="flex-1">
              {/* Eyebrow */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#1AABBD]/25 bg-[#1AABBD]/10 px-4 py-2 text-xs font-semibold tracking-widest text-[#1AABBD] uppercase backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F9B233] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F9B233]"></span>
                </span>
                Now delivering · Anfeh, North Lebanon
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
                The food you
                <br />
                love,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#F9B233]">delivered</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                  >
                    <path
                      d="M2 6 C50 2, 100 2, 198 6"
                      stroke="#1AABBD"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <br />
                <span className="text-[#1AABBD]">to your door.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 md:text-lg">
                Browse menus from Anfeh's best restaurants. Add items to your
                cart and send your order directly via WhatsApp — fast and easy.
              </p>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap items-center gap-6">
                {[
                  { value: restaurants.length, label: "Restaurants" },
                  { value: `${totalItems}+`, label: "Menu items" },
                  { value: "24/7", label: "Ordering" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-2xl font-black text-white md:text-3xl">
                      {s.value}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#restaurants"
                className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-[#F9B233] px-8 py-4 text-base font-black text-[#0C2B35] shadow-lg shadow-[#F9B233]/20 transition-all hover:bg-[#f0a820] hover:-translate-y-0.5 active:scale-95"
              >
                Explore Restaurants
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section className="border-b border-slate-200 bg-white px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              {
                icon: "🍽️",
                step: "01",
                title: "Browse & Search",
                desc: "Find any restaurant by name or scroll through all Anfeh spots.",
              },
              {
                icon: "🛒",
                step: "02",
                title: "Add to Cart",
                desc: "Tap + on any item. Build your full order from one or multiple restaurants.",
              },
              {
                icon: "💬",
                step: "03",
                title: "Order via WhatsApp",
                desc: "Enter your name and location, press the button — we receive it instantly.",
              },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 px-6 py-6 first:pl-0 last:pr-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF8FA] text-xl">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-black tracking-widest text-[#1AABBD] uppercase">
                    Step {s.step}
                  </p>
                  <p className="mt-0.5 font-extrabold text-[#0C2B35]">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          RESTAURANT GRID (client — includes search)
      ══════════════════════════════ */}
      <RestaurantGrid restaurants={restaurants as Parameters<typeof RestaurantGrid>[0]["restaurants"]} />
    </main>
  );
}
