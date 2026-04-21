"use client";

import { useLang, t } from "../context/language";
import RestaurantGrid from "./RestaurantGrid";

type Restaurant = Parameters<typeof RestaurantGrid>[0]["restaurants"][0];

export default function HomeClient({
  restaurants,
  totalItems,
}: {
  restaurants: Restaurant[];
  totalItems: number;
}) {
  const { lang } = useLang();
  const T = t[lang];

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
            {T.hero_badge}
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-[#0C2B35] md:text-6xl">
            {T.hero_h1a}
            <br />
            <span className="text-[#1AABBD]">{T.hero_h1b}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-base text-slate-500">
            {T.hero_sub(restaurants.length, totalItems)}
          </p>

          <a
            href="#restaurants"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#1AABBD] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#1AABBD]/25 transition hover:bg-[#168fa0] hover:-translate-y-0.5 active:scale-95"
          >
            {T.hero_cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-4xl px-5 pb-6">
        <div className="grid grid-cols-1 divide-y divide-[#1AABBD]/10 rounded-3xl border border-[#1AABBD]/15 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {T.how.map((s) => (
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

      {/* SERVICE SECTIONS */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* RESTAURANTS */}
            <div className="group cursor-pointer overflow-hidden rounded-3xl border border-[#1AABBD]/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#1AABBD]/40 hover:shadow-xl hover:shadow-[#1AABBD]/15">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#1AABBD] to-[#168fa0]">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-2xl font-black">{T.grid_title}</h3>
                    <p className="mt-2 text-sm opacity-90">{restaurants.length} restaurants & {totalItems} items</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">Order from the best restaurants in Anfeh, Lebanon. Fast delivery, great food.</p>
                <a
                  href="#restaurants"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#1AABBD] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#168fa0] group-hover:translate-x-1"
                >
                  {T.hero_cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* GROCERY */}
            <div className="group cursor-pointer overflow-hidden rounded-3xl border border-[#10B981]/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#10B981]/40 hover:shadow-xl hover:shadow-[#10B981]/15">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#10B981] to-[#059669]">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-2xl font-black">{lang === "ar" ? "بقالة" : "Grocery"}</h3>
                    <p className="mt-2 text-sm opacity-90">{lang === "ar" ? "قريباً" : "Coming Soon"}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">{lang === "ar" ? "احصل على احتياجاتك اليومية مع توصيل سريع إلى باب منزلك." : "Get your daily essentials with fast delivery to your door."}</p>
                <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-300 px-6 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
                  {lang === "ar" ? "قريباً" : "Coming Soon"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* TAXI SERVICE */}
            <div className="group cursor-pointer overflow-hidden rounded-3xl border border-[#F59E0B]/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#F59E0B]/40 hover:shadow-xl hover:shadow-[#F59E0B]/15">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#F59E0B] to-[#D97706]">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-2xl font-black">{lang === "ar" ? "خدمة تاكسي" : "Taxi Service"}</h3>
                    <p className="mt-2 text-sm opacity-90">{lang === "ar" ? "قريباً" : "Coming Soon"}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">{lang === "ar" ? "احجز رحلة آمنة ومريحة في أنحاء عنفة ولبنان." : "Book safe and comfortable rides around Anfeh and Lebanon."}</p>
                <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-300 px-6 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
                  {lang === "ar" ? "قريباً" : "Coming Soon"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* RESTAURANTS GRID */}
      <RestaurantGrid restaurants={restaurants} />
    </main>
  );
}
