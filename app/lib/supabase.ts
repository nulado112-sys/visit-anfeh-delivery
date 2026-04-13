import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type OrderStatus = "pending" | "preparing" | "out_for_delivery" | "delivered";

export type OrderItem = {
  restaurantName: string;
  name: string;
  price: number | null;
  priceLbp: number | null;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  zone: string;
  address: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  subtotal_lbp: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  driver_name: string | null;
  driver_lat: number | null;
  driver_lng: number | null;
  driver_updated_at: string | null;
  created_at: string;
};

export function generateOrderNumber(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `AN-${digits}`;
}

export const STATUS_LABELS: Record<OrderStatus, { en: string; ar: string; color: string; icon: string }> = {
  pending:          { en: "Order Received",    ar: "تم استلام الطلب",   color: "#F9B233", icon: "📋" },
  preparing:        { en: "Preparing",          ar: "جاري التحضير",      color: "#1AABBD", icon: "👨‍🍳" },
  out_for_delivery: { en: "Out for Delivery",   ar: "في الطريق إليك",    color: "#8B5CF6", icon: "🛵" },
  delivered:        { en: "Delivered",          ar: "تم التوصيل",        color: "#10B981", icon: "✅" },
};
