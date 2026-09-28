import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";

const page = { data: [], meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 } };

vi.mock("@/lib/api/endpoints", () => ({
  catalogApi: {
    home: vi.fn(async () => ({ banners: [], categories: [], featured_products: [], popular_products: [] })),
    categories: vi.fn(async () => []),
  },
  walletApi: { wallet: vi.fn(async () => ({ currency: "USD", balance_minor: 0, pending_deposits: { count: 0, amount_minor: 0 } })) },
  ordersApi: { list: vi.fn(async () => ({ ...page, summary: {} })) },
  favoritesApi: { list: vi.fn(async () => page) },
}));

describe("warmSession", () => {
  it("stores favorites in the infinite shape the favorites screen reads", async () => {
    const { warmSession } = await import("./warm-session");
    const client = new QueryClient();
    warmSession(client);

    await vi.waitFor(() => expect(client.getQueryData(queryKeys.favorites)).toBeDefined());
    expect(client.getQueryData(queryKeys.favorites)).toEqual({ pages: [page], pageParams: [1] });
  });
});
