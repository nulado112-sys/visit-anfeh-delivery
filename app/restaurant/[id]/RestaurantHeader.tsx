"use client";

import Link from "next/link";
import LogoImage from "../../components/LogoImage";
import { useLang, t } from "../../context/language";

type Props = {
  name: string;
  name_ar?: string;
  logo?: string;
  logo_bg?: string;
  logo_fit?: string;
  phone?: string;
  categoriesCount: number;
  totalItems: number;
};

export default function RestaurantHeader({ name, name_ar, logo, logo_bg, logo_fit, phone, categoriesCount, totalItems }: Props) {
  const { lang } = useLang();
  const T = t[lang];

  return (
    <section className="border-b border-[#1AABBD]/15 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <Link
          href="/#restaurants"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-[#1AABBD]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: lang === "ar" ? "scaleX(-1)" : undefined }}>
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {T.back}
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#1AABBD]/15"
            style={{ backgroundColor: logo_fit === "contain" ? "#ffffff" : (logo_bg || "#EBF8FA") }}
          >
            <LogoImage
              src={`/logos/${logo}`}
              alt={name}
              fill
              fallback={name[0]}
              className={logo_fit === "contain" ? "object-contain p-1" : "object-contain p-2"}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight text-[#0C2B35] md:text-4xl">
              {name}
            </h1>
            {name_ar && <p className="mt-1 text-lg text-slate-400">{name_ar}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {T.open_now}
              </span>
              <span className="text-slate-400">{categoriesCount} {T.grid_categories}</span>
              <span className="text-slate-400">{totalItems} {T.grid_items}</span>
              {phone && (
                <a href={`tel:${phone}`} className="font-semibold text-[#1AABBD] hover:underline">
                  📞 {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
