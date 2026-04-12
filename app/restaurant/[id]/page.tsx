import Link from "next/link";
import LogoImage from "../../components/LogoImage";
import { notFound } from "next/navigation";
import data from "../../data/restaurants.json";
import MenuTabs from "./MenuTabs";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return data.restaurants.map((r) => ({ id: r.id }));
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const restaurant = data.restaurants.find((r) => r.id === id);
  if (!restaurant) notFound();

  const categories = restaurant.categories ?? [];
  const totalItems = categories.reduce(
    (sum, cat) => sum + (cat.items?.length ?? 0),
    0,
  );

  return (
    <main>
      {/* Header */}
      <section className="border-b border-[#1AABBD]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <Link
            href="/#restaurants"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-[#1AABBD]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            All Restaurants
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#1AABBD]/15 bg-[#EBF8FA]">
              <LogoImage
                src={`/logos/${restaurant.logo}`}
                alt={restaurant.name}
                fill
                fallback={restaurant.name[0]}
                className="object-contain p-2"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight text-[#0C2B35] md:text-4xl">
                {restaurant.name}
              </h1>
              {"name_ar" in restaurant && restaurant.name_ar && (
                <p className="mt-1 text-lg text-slate-400">{restaurant.name_ar as string}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Open Now
                </span>
                <span className="text-slate-400">{categories.length} categories</span>
                <span className="text-slate-400">{totalItems} items</span>
                {"phone" in restaurant && restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="font-semibold text-[#1AABBD] hover:underline"
                  >
                    📞 {restaurant.phone as string}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="mx-auto max-w-7xl px-5 py-10">
        <MenuTabs
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          categories={categories as Parameters<typeof MenuTabs>[0]["categories"]}
          currencyNote={data.currency_note}
        />
      </section>
    </main>
  );
}
