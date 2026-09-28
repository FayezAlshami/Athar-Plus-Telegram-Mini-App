import type { QueryClient } from "@tanstack/react-query";
import { catalogApi, favoritesApi, ordersApi, walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { prefetchImage } from "@/lib/images/prefetch-image";
import { CATALOG_STALE_MS, PRIVATE_STALE_MS } from "@/lib/query/policy";

/** After sign-in, warm the screens people open first. Failures stay silent. */
export function warmSession(queryClient: QueryClient): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.home,
    queryFn: ({ signal }) => catalogApi.home({ signal }),
    staleTime: CATALOG_STALE_MS,
  });
  void queryClient.prefetchQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => catalogApi.categories({ signal }),
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
  void queryClient.prefetchQuery({
    queryKey: queryKeys.favorites,
    queryFn: ({ signal }) => favoritesApi.list(1, { signal }),
    staleTime: PRIVATE_STALE_MS,
  });

  void queryClient
    .fetchQuery({
      queryKey: queryKeys.home,
      queryFn: ({ signal }) => catalogApi.home({ signal }),
      staleTime: CATALOG_STALE_MS,
    })
    .then((feed) => {
      for (const product of [...feed.featured_products, ...feed.popular_products]) prefetchImage(product.image_url);
      for (const banner of feed.banners) prefetchImage(banner.image_url);
    })
    .catch(() => undefined);
}
