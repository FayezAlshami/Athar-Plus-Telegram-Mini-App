import type { Paginated } from "@/entities/shared";
import type { AuthSession, User } from "@/entities/user/types";
import type { HomeFeed } from "@/entities/banner/types";
import type { Category } from "@/entities/category/types";
import type { Product, ProductDetail } from "@/entities/product/types";
import type { CreateOrderInput, Order, OrderDetail } from "@/entities/order/types";
import type { Deposit, GiftCodeRedemption, PaymentMethod, Wallet, WalletTransaction } from "@/entities/wallet/types";
import type { MembershipOverview } from "@/entities/membership/types";
import type { AppNotification } from "@/entities/notification/types";
import type { StructuredTextBlock } from "@/entities/shared";
import type { Locale } from "@/lib/i18n/config";
import { apiFetch, apiRequest } from "./client";

/** Every dynamic value becomes exactly one path segment, so `../` can never reach another endpoint. */
export function seg(value: string | number): string {
  const text = String(value);
  // "." and ".." survive encoding and would still be resolved as dot-segments.
  return text === "." || text === ".." || text === "" ? "-" : encodeURIComponent(text);
}

type Signal = { signal?: AbortSignal };

export const shareApi = {
  prepare: (input: { type: "product" | "referral"; product_id?: number }) =>
    apiRequest<{ id: string; expiration_date: number | null }>("/share/prepared", { method: "POST", body: input }),
};

export const authApi = {
  telegram: (initData: string) =>
    apiRequest<AuthSession>("/auth/telegram", { method: "POST", body: { init_data: initData } }),
  development: (user: Record<string, unknown>) =>
    apiRequest<AuthSession>("/auth/development", { method: "POST", body: { user } }),
};

export const catalogApi = {
  home: ({ signal }: Signal = {}) => apiRequest<HomeFeed>("/home", { signal }),
  categories: ({ signal }: Signal = {}) => apiRequest<Category[]>("/categories", { signal }),
  category: (slug: string, { signal }: Signal = {}) => apiRequest<Category>(`/categories/${seg(slug)}`, { signal }),
  products: (query: { category?: string; page?: number }, { signal }: Signal = {}) =>
    apiFetch<Paginated<Product>>("/products", { query, signal }),
  product: (idOrSlug: string, { signal }: Signal = {}) =>
    apiRequest<ProductDetail>(`/products/${seg(idOrSlug)}`, { signal }),
  search: (q: string, { signal }: Signal = {}) =>
    apiRequest<{ query: string; products: Product[]; categories: Category[] }>("/search", { query: { q }, signal }),
  campaign: (slug: string, { signal }: Signal = {}) =>
    apiRequest<{ slug: string; title: string; description: StructuredTextBlock[]; image_url: string | null; ends_at: string | null; products: Product[] }>(
      `/campaigns/${seg(slug)}`,
      { signal },
    ),
};

export const walletApi = {
  wallet: ({ signal }: Signal = {}) => apiRequest<Wallet>("/wallet", { signal }),
  transactions: (page: number, { signal }: Signal = {}) =>
    apiFetch<Paginated<WalletTransaction>>("/wallet/transactions", { query: { page }, signal }),
  paymentMethods: ({ signal }: Signal = {}) => apiRequest<PaymentMethod[]>("/payment-methods", { signal }),
  deposits: (page: number, { signal }: Signal = {}) => apiFetch<Paginated<Deposit>>("/deposits", { query: { page }, signal }),
  createDeposit: (
    input: { payment_method: string; amount_minor: number; details?: Record<string, unknown> },
    idempotencyKey: string,
  ) => apiRequest<Deposit>("/deposits", { method: "POST", body: input, idempotencyKey }),
  redeemGiftCode: (code: string) =>
    apiRequest<GiftCodeRedemption>("/gift-codes/redeem", { method: "POST", body: { code } }),
};

export type OrderStatusGroup = "active" | "completed" | "closed";

export interface OrderListSummary {
  total: number;
  completed: number;
  failed: number;
  completed_amount_minor: number;
  currency: string;
}

export const ordersApi = {
  list: (
    query: { page: number; status?: OrderStatusGroup; from?: string; to?: string; q?: string },
    { signal }: Signal = {},
  ) => apiFetch<Paginated<Order> & { summary: OrderListSummary }>("/orders", { query, signal }),
  get: (id: string, { signal }: Signal = {}) => apiRequest<OrderDetail>(`/orders/${seg(id)}`, { signal }),
  create: (input: CreateOrderInput, idempotencyKey: string) =>
    apiRequest<OrderDetail>("/orders", { method: "POST", body: input, idempotencyKey }),
  cancel: (id: string) => apiRequest<OrderDetail>(`/orders/${seg(id)}/cancel`, { method: "POST" }),
};

export const favoritesApi = {
  list: (page: number, { signal }: Signal = {}) => apiFetch<Paginated<Product>>("/favorites", { query: { page }, signal }),
  add: (productId: number) => apiRequest<Product>("/favorites", { method: "POST", body: { product_id: productId } }),
  remove: (productId: number) => apiFetch<void>(`/favorites/${seg(productId)}`, { method: "DELETE" }),
};

export const accountApi = {
  profile: ({ signal }: Signal = {}) => apiRequest<User>("/profile", { signal }),
  updateProfile: (input: { locale?: Locale }) => apiRequest<User>("/profile", { method: "PATCH", body: input }),
  membership: ({ signal }: Signal = {}) => apiRequest<MembershipOverview>("/membership", { signal }),
  notifications: (page: number, { signal }: Signal = {}) =>
    apiFetch<Paginated<AppNotification> & { meta: { unread_count: number } }>("/notifications", { query: { page }, signal }),
  markNotificationRead: (id: number) => apiRequest<AppNotification>(`/notifications/${seg(id)}/read`, { method: "POST" }),
  markAllNotificationsRead: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
  grantWriteAccess: () => apiRequest<User>("/me/write-access", { method: "POST" }),
};
