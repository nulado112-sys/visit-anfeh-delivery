import data from "./data/restaurants.json";
import HomeClient from "./components/HomeClient";

export default function Home() {
  const restaurants = data.restaurants;
  const totalItems = restaurants.reduce(
    (s, r) => s + (r.categories ?? []).reduce((cs, c) => cs + (c.items?.length ?? 0), 0),
    0,
  );
  return (
    <HomeClient
      restaurants={restaurants as Parameters<typeof HomeClient>[0]["restaurants"]}
      totalItems={totalItems}
    />
  );
}
