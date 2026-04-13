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
      {/* ══ HERO — left-aligned, editorial ══ */}
      <section className="relative overflow-hidden px-5 pt-14 pb-10">
        {/* Background accent block — top right, breaks the grid */}
        <div
          className="pointer-events-none absolute -top-10 right-0 h-[420px] w-[340px] rounded-bl-[80px] bg-[#1AABBD]/6"
          aria-hidden
        />
        {/* Thin vertical accent line */}
        <div
          className="pointer-events-none absolute top-0 right-[340px] h-[180px] w-px bg-[#1AABBD]/20"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            {/* Live badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1AABBD]/20 bg-white px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-[#1AABBD] uppercase shadow-sm animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1AABBD] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1AABBD]" />
              </span>
              {T.hero_badge}
            </div>

            {/* Headline — display font, large, editorial */}
            <h1
              className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.0] tracking-tight text-[#0C2B35] animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              {T.hero_h1a}
              <br />
              <em className="not-italic text-[#1AABBD]">{T.hero_h1b}</em>
            </h1>

            {/* Tagline */}
            <p
              className="mt-6 max-w-sm text-base leading-relaxed text-slate-500 animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              {T.hero_sub(restaurants.length, totalItems)}
            </p>

            {/* Stats row */}
            <div
              className="mt-7 flex items-center gap-8 animate-fade-up"
              style={{ animationDelay: "220ms" }}
            >
              {[
                { value: `${restaurants.length}`, label: lang === "ar" ? "مطعم" : "Restaurants" },
                { value: `${totalItems}+`, label: lang === "ar" ? "صنف" : "Menu items" },
                { value: "24/7", label: lang === "ar" ? "طلبات" : "Ordering" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-black text-[#0C2B35]">{s.value}</p>
                  <p className="text-xs font-medium text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="mt-8 flex flex-wrap items-center gap-4 animate-fade-up"
              style={{ animationDelay: "280ms" }}
            >
              <a
                href="#restaurants"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1AABBD] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1AABBD]/25 transition-all hover:bg-[#168fa0] hover:-translate-y-0.5 active:scale-95"
              >
                {T.hero_cta}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="https://wa.me/96181526075"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#1AABBD]/20 bg-white px-5 py-3.5 text-sm font-semibold text-[#0C2B35] transition hover:border-[#1AABBD]/40 hover:bg-[#EBF8FA]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {lang === "ar" ? "تواصل معنا" : "Chat with us"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS — horizontal cards, not centered ══ */}
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="grid grid-cols-1 divide-y divide-[#1AABBD]/10 rounded-3xl border border-[#1AABBD]/15 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {T.how.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3.5 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4FAFB] text-xl font-display font-black text-[#1AABBD]">
                {i + 1}
              </div>
              <div>
                <p className="font-display font-black text-[#0C2B35]">{s.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ RESTAURANTS ══ */}
      <RestaurantGrid restaurants={restaurants} />
    </main>
  );
}
