import type { QueryClient } from "@tanstack/react-query";
import { catalogApi, favoritesApi, ordersApi, walletApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { prefetchImage } from "@/lib/images/prefetch-image";
import { CATALOG_STALE_MS, PRIVATE_STALE_MS } from "@/lib/query/policy";

/** After sign-in, warm the screens people open first. Failures stay silent. */
export function warmSession(queryClient: QueryClient): void {
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
  // Must match useFavorites' infinite shape ({ pages, pageParams }); a plain query here breaks that screen.
  void queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.favorites,
    queryFn: ({ pageParam, signal }) => favoritesApi.list(pageParam, { signal }),
    initialPageParam: 1,
    staleTime: PRIVATE_STALE_MS,
  });

  // One home request (reused if already cached) that also warms the images people see first.
  void queryClient
    .ensureQueryData({
      queryKey: queryKeys.home,
      queryFn: ({ signal }) => catalogApi.home({ signal }),
      staleTime: CATALOG_STALE_MS,
    })
    .then((feed) => {
      for (const product of [...feed.featured_products, ...feed.popular_products]) prefetchImage(product.image_url);
      for (const product of feed.featured_products.slice(0, 4)) {
        void queryClient.prefetchQuery({
          queryKey: queryKeys.product(String(product.id)),
          queryFn: ({ signal }) => catalogApi.product(String(product.id), { signal }),
          staleTime: CATALOG_STALE_MS,
        });
      }
      for (const banner of feed.banners) prefetchImage(banner.image_url);
    })
    .catch(() => undefined);
}
