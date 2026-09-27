"use client";

import { useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { catalogQueryOptions } from "@/lib/query/policy";
import { usePrefetchOnIntent } from "@/hooks/use-prefetch-on-intent";

export function usePrefetchProduct(id: number) {
  const client = useQueryClient();
  return usePrefetchOnIntent(`/products/${id}`, () => {
    void client.prefetchQuery({
      ...catalogQueryOptions,
      queryKey: queryKeys.product(String(id)),
      queryFn: ({ signal }) => catalogApi.product(String(id), { signal }),
    });
  });
}

export function usePrefetchCategory(slug: string) {
  const client = useQueryClient();
  return usePrefetchOnIntent(`/categories/${slug}`, () => {
    void client.prefetchQuery({
      ...catalogQueryOptions,
      queryKey: queryKeys.category(slug),
      queryFn: ({ signal }) => catalogApi.category(slug, { signal }),
    });
    void client.prefetchInfiniteQuery({
      ...catalogQueryOptions,
      queryKey: queryKeys.products(slug),
      queryFn: ({ pageParam, signal }) => catalogApi.products({ category: slug, page: pageParam }, { signal }),
      initialPageParam: 1,
    });
  });
}
