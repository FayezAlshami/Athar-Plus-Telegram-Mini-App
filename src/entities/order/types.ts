import type { StructuredTextBlock } from "@/entities/shared";
import type { ServicePeriod } from "@/entities/product/types";

export type OrderStatus = "pending" | "confirmed" | "processing" | "completed" | "cancelled" | "rejected" | "refunded";

export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = ["pending", "confirmed", "processing"];

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  is_cancellable: boolean;
  refundable: boolean;
  can_request_refund: boolean;
  has_open_refund: boolean;
  product: { id: number; slug: string | null; name: string | null; variant_name?: string | null; image_url: string | null };
  currency: string;
  base_price_minor: number;
  discount_minor: number;
  total_minor: number;
  fulfillment_type: "manual" | "inventory";
  is_preorder: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface OrderRefundRequest {
  id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason: string;
  decision_note: string | null;
  amount_minor: number;
  currency: string;
}

export interface OrderService {
  is_subscription: boolean;
  subscription_period: ServicePeriod | null;
  activation_method: StructuredTextBlock[];
  terms: StructuredTextBlock[];
  warranty_period: ServicePeriod | null;
}

export interface OrderDetail extends Order {
  inputs: { key: string; label: string; value: string }[];
  customer_note: string | null;
  delivery: string | null;
  service: OrderService | null;
  timeline: { status: OrderStatus; at: string }[];
  refund_request?: OrderRefundRequest | null;
}

export interface CreateOrderInput {
  product_id: number;
  variant_id?: number;
  inputs: Record<string, string>;
  customer_note?: string;
}
