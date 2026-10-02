export type OrderStatus = "pending" | "confirmed" | "processing" | "completed" | "cancelled" | "rejected";

export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = ["pending", "confirmed", "processing"];

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  is_cancellable: boolean;
  product: { id: number; slug: string | null; name: string | null; variant_name?: string | null; image_url: string | null };
  currency: string;
  base_price_minor: number;
  discount_minor: number;
  total_minor: number;
  fulfillment_type: "manual" | "inventory";
  created_at: string;
  completed_at: string | null;
}

export interface OrderDetail extends Order {
  inputs: { key: string; label: string; value: string }[];
  customer_note: string | null;
  delivery: string | null;
  timeline: { status: OrderStatus; at: string }[];
}

export interface CreateOrderInput {
  product_id: number;
  variant_id?: number;
  inputs: Record<string, string>;
  customer_note?: string;
}
