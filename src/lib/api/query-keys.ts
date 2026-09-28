/** Central query-key factory so invalidation never relies on ad-hoc arrays. */
export const queryKeys = {
  home: ["home"] as const,
  categories: ["categories"] as const,
  category: (slug: string) => ["categories", slug] as const,
  productsRoot: ["products"] as const,
  products: (category?: string) => ["products", { category }] as const,
  favorites: ["favorites"] as const,
  product: (idOrSlug: string) => ["product", idOrSlug] as const,
  search: (q: string) => ["search", q] as const,
  campaign: (slug: string) => ["campaign", slug] as const,
  wallet: ["wallet"] as const,
  walletTransactions: ["wallet", "transactions"] as const,
  paymentMethods: ["payment-methods"] as const,
  deposits: ["deposits"] as const,
  orders: (filters?: { status?: string; from?: string; to?: string; q?: string }) =>
    ["orders", {
      status: filters?.status ?? null,
      from: filters?.from ?? null,
      to: filters?.to ?? null,
      q: filters?.q ?? null,
    }] as const,
  ordersRoot: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  profile: ["profile"] as const,
  membership: ["membership"] as const,
  notifications: ["notifications"] as const,
};
