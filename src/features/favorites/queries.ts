import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { Product } from "@/entities/product/types";
import type { Paginated } from "@/entities/shared";
import { isApiError } from "@/lib/api/errors";
import { favoritesApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { assertOnline } from "@/lib/network/assert-online";
import { privateQueryOptions } from "@/lib/query/policy";

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
    mutationFn: async ({ productId, save }: { productId: number; save: boolean }) => {
      assertOnline();
      if (save) return favoritesApi.add(productId);
      try {
        await favoritesApi.remove(productId);
      } catch (error) {
        if (!(isApiError(error) && error.status === 404)) throw error;
      }
      return null;
    },
    onSuccess: (_data, { productId, save }) => {
      queryClient.setQueriesData<InfiniteData<Paginated<Product>>>({ queryKey: queryKeys.favorites }, (current) => {
        if (!current || save) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({ ...page, data: page.data.filter((item) => item.id !== productId) })),
        };
      });
      queryClient.setQueryData<Product>(queryKeys.product(String(productId)), (current) =>
        current ? { ...current, is_favorite: save } : current,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      void queryClient.invalidateQueries({ queryKey: queryKeys.productsRoot });
    },
  });
}
