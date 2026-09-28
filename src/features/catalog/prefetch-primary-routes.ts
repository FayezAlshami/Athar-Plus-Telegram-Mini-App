import type { QueryClient } from "@tanstack/react-query";
import { catalogApi, ordersApi, walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { CATALOG_STALE_MS, PRIVATE_STALE_MS } from "@/lib/query/policy";

/** Prefetches data for a bottom-nav destination before the user opens it. */
export function prefetchPrimaryRoute(queryClient: QueryClient, href: string): void {
  switch (href) {
    case "/":
      void queryClient.prefetchQuery({ queryKey: queryKeys.home, queryFn: ({ signal }) => catalogApi.home({ signal }), staleTime: CATALOG_STALE_MS });
      return;
    case "/categories":
      void queryClient.prefetchQuery({ queryKey: queryKeys.categories, queryFn: ({ signal }) => catalogApi.categories({ signal }), staleTime: CATALOG_STALE_MS });
      return;
    case "/orders":
      void queryClient.prefetchInfiniteQuery({
        queryKey: queryKeys.orders(undefined),
        queryFn: ({ pageParam, signal }) => ordersApi.list({ page: pageParam }, { signal }),
        initialPageParam: 1,
        staleTime: PRIVATE_STALE_MS,
      });
      return;
    case "/wallet":
      void queryClient.prefetchQuery({ queryKey: queryKeys.wallet, queryFn: ({ signal }) => walletApi.wallet({ signal }), staleTime: PRIVATE_STALE_MS });
      return;
    case "/profile":
      return;
    default:
      return;
  }
}
