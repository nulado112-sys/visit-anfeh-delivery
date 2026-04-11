import Link from "next/link";
import LogoImage from "./components/LogoImage";
import data from "./data/restaurants.json";

export default function Home() {
  const restaurants = data.restaurants;

  function countItems(restaurant: (typeof restaurants)[0]) {
    return (restaurant.categories ?? []).reduce(
      (sum, cat) => sum + (cat.items?.length ?? 0),
      0,
    );
  }

  const totalItems = restaurants.reduce((s, r) => s + countItems(r), 0);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0C2B35] px-5 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#1AABBD]/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#F9B233]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col items-start gap-6 md:gap-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1AABBD]/30 bg-[#1AABBD]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#1AABBD] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F9B233]" />
              Anfeh, North Lebanon
            </div>

            <div>
              <h1 className="text-5xl font-black leading-none tracking-tighter text-white md:text-7xl">
                Your city&apos;s
                <br />
                <span className="text-[#F9B233]">best food</span>
                <br />
                <span className="text-[#1AABBD]">delivered.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                Browse menus from {restaurants.length} local restaurants in
                Anfeh. Pick your favourites and order straight via WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-2">
              <div>
                <p className="text-3xl font-black text-white">{restaurants.length}</p>
                <p className="mt-0.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">Restaurants</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">{totalItems}+</p>
                <p className="mt-0.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">Menu Items</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">$1</p>
                <p className="mt-0.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">Delivery Fee</p>
              </div>
            </div>

            <a
              href="#restaurants"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#F9B233] px-7 py-3.5 text-base font-black text-[#0C2B35] shadow-lg shadow-[#F9B233]/20 transition hover:bg-[#f0a820] hover:-translate-y-0.5 active:scale-95"
            >
              Browse Restaurants
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-b border-slate-200 bg-white px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: "🍽️", step: "01", title: "Browse Menus", desc: "Explore full menus from all Anfeh restaurants in one place." },
              { icon: "🛒", step: "02", title: "Build Your Order", desc: "Tap any item to add it to your cart. Mix from multiple restaurants." },
              { icon: "💬", step: "03", title: "Order via WhatsApp", desc: "Fill your details, hit the button, and your order goes straight to us." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF8FA] text-2xl">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#1AABBD] uppercase">Step {s.step}</p>
                  <p className="mt-0.5 font-bold text-[#0C2B35]">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Restaurant Grid ── */}
      <section id="restaurants" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#1AABBD] uppercase">Where to eat</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0C2B35]">All Restaurants</h2>
            </div>
            <p className="hidden text-sm text-slate-400 md:block">{restaurants.length} places · Anfeh</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, idx) => {
              const itemCount = countItems(restaurant);
              const hasLogo = !!restaurant.logo;

              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1AABBD]/10 hover:border-[#1AABBD]/30"
                >
                  {/* Logo area */}
                  <div className="relative h-40 overflow-hidden bg-white">
                    {hasLogo ? (
                      <LogoImage
                        src={`/logos/${restaurant.logo}`}
                        alt={restaurant.name}
                        fill
                        fallback={restaurant.name[0]}
                        className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl font-black text-[#1AABBD]/20">
                        {restaurant.name[0]}
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 h-px bg-slate-100" />
                    <div className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[#0C2B35] text-xs font-black text-white">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-extrabold leading-tight tracking-tight text-[#0C2B35] transition-colors group-hover:text-[#1AABBD]">
                          {restaurant.name}
                        </h3>
                        {"name_ar" in restaurant && restaurant.name_ar && (
                          <p className="mt-0.5 text-sm text-slate-400">{restaurant.name_ar as string}</p>
                        )}
                      </div>
                      <div className="shrink-0 rounded-full bg-[#EBF8FA] px-2.5 py-1 text-xs font-bold text-[#1AABBD]">
                        {itemCount} items
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        Open
                      </span>
                      <span className="text-xs text-slate-400">
                        {(restaurant.categories ?? []).length} categories
                      </span>
                      {"phone" in restaurant && restaurant.phone && (
                        <span className="text-xs text-slate-400">📞 {restaurant.phone as string}</span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                    <span className="text-sm font-bold text-[#1AABBD]">View Menu</span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1AABBD] text-white transition-transform group-hover:translate-x-0.5">
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
    </main>
  );
}
