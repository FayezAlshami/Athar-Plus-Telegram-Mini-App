import type { QueryClient } from "@tanstack/react-query";
import { catalogApi, ordersApi, walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { CATALOG_STALE_MS, PRIVATE_STALE_MS } from "@/lib/query/policy";

/** After sign-in, warm the screens people open first. Failures stay silent. */
export function warmSession(queryClient: QueryClient): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.home,
    queryFn: ({ signal }) => catalogApi.home({ signal }),
    staleTime: CATALOG_STALE_MS,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.wallet,
    queryFn: ({ signal }) => walletApi.wallet({ signal }),
    staleTime: PRIVATE_STALE_MS,
  });
  void queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.orders(undefined),
    queryFn: ({ pageParam, signal }) => ordersApi.list({ page: pageParam }, { signal }),
    initialPageParam: 1,
    staleTime: PRIVATE_STALE_MS,
  });
}
