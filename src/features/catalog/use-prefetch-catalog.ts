"use client";

import { useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { catalogQueryOptions } from "@/lib/query/policy";
import { prefetchImage } from "@/lib/images/prefetch-image";
import { usePrefetchOnIntent } from "@/hooks/use-prefetch-on-intent";

export function usePrefetchProduct<E extends HTMLElement = HTMLDivElement>(id: number, imageUrl?: string | null) {
  const client = useQueryClient();
  return usePrefetchOnIntent<E>(`/products/${id}`, () => {
    prefetchImage(imageUrl);
    void client
      .fetchQuery({
        ...catalogQueryOptions,
        queryKey: queryKeys.product(String(id)),
        queryFn: ({ signal }) => catalogApi.product(String(id), { signal }),
      })
      .then((product) => prefetchImage(product.image_url));
  });
}

export function usePrefetchCategory<E extends HTMLElement = HTMLDivElement>(slug: string) {
  const client = useQueryClient();
  return usePrefetchOnIntent<E>(`/categories/${slug}`, () => {
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
