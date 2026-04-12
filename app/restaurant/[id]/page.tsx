import { notFound } from "next/navigation";
import RestaurantHeader from "./RestaurantHeader";
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
      <RestaurantHeader
        name={restaurant.name}
        name_ar={"name_ar" in restaurant ? restaurant.name_ar as string : undefined}
        logo={restaurant.logo}
        phone={"phone" in restaurant ? restaurant.phone as string : undefined}
        categoriesCount={categories.length}
        totalItems={totalItems}
      />

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
