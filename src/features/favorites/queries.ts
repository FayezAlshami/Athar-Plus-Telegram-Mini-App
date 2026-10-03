import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import type { HomeFeed } from "@/entities/banner/types";
import type { Product } from "@/entities/product/types";
import type { Paginated } from "@/entities/shared";
import { isApiError } from "@/lib/api/errors";
import { favoritesApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { assertOnline } from "@/lib/network/assert-online";
import { privateQueryOptions } from "@/lib/query/policy";

const favoriteChains = new Map<number, Promise<unknown>>();

function withFavorite(product: Product, productId: number, save: boolean): Product {
  return product.id === productId ? { ...product, is_favorite: save } : product;
}

/** Flip the heart on every cached copy of the product before the request returns. */
function paintFavorite(queryClient: QueryClient, productId: number, save: boolean) {
  const map = (product: Product) => withFavorite(product, productId, save);
  queryClient.setQueryData<HomeFeed>(queryKeys.home, (current) =>
    current
      ? { ...current, featured_products: current.featured_products.map(map), popular_products: current.popular_products.map(map) }
      : current,
  );
  queryClient.setQueriesData<Paginated<Product>>({ queryKey: queryKeys.productsRoot }, (current) =>
    current?.data ? { ...current, data: current.data.map(map) } : current,
  );
  queryClient.setQueriesData<Product>({ queryKey: ["product"] }, (current) => (current && current.id === productId ? map(current) : current));
  queryClient.setQueriesData<{ products: Product[] }>({ queryKey: ["search"] }, (current) =>
    current?.products ? { ...current, products: current.products.map(map) } : current,
  );
  queryClient.setQueriesData<InfiniteData<Paginated<Product>>>({ queryKey: queryKeys.favorites }, (current) => {
    if (!current) return current;
    if (save) return current;
    return { ...current, pages: current.pages.map((page) => ({ ...page, data: page.data.filter((item) => item.id !== productId) })) };
  });
}

export function useFavorites() {
  return useInfiniteQuery({
    ...privateQueryOptions,
    queryKey: queryKeys.favorites,
    queryFn: ({ pageParam, signal }) => favoritesApi.list(pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, save }: { productId: number; save: boolean }) => {
      assertOnline();
      const previous = favoriteChains.get(productId) ?? Promise.resolve();
      const run = previous.catch(() => undefined).then(async () => {
        if (save) return favoritesApi.add(productId);
        try {
          await favoritesApi.remove(productId);
        } catch (error) {
          if (!(isApiError(error) && error.status === 404)) throw error;
        }
        return null;
      });
      favoriteChains.set(productId, run);
      return run;
    },
    onMutate: ({ productId, save }) => {
      paintFavorite(queryClient, productId, save);
    },
    onError: (_error, { productId, save }) => {
      paintFavorite(queryClient, productId, !save);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}
