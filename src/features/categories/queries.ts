import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { catalogQueryOptions } from "@/lib/query/policy";

export function useHomeFeed() {
  return useQuery({ ...catalogQueryOptions, queryKey: queryKeys.home, queryFn: ({ signal }) => catalogApi.home({ signal }) });
}

export function useCategories() {
  return useQuery({ ...catalogQueryOptions, queryKey: queryKeys.categories, queryFn: ({ signal }) => catalogApi.categories({ signal }) });
}

export function useCategory(slug: string) {
  return useQuery({ ...catalogQueryOptions, queryKey: queryKeys.category(slug), queryFn: ({ signal }) => catalogApi.category(slug, { signal }) });
}

export function useCategoryProducts(slug: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products(slug),
    queryFn: ({ pageParam, signal }) => catalogApi.products({ category: slug, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    placeholderData: keepPreviousData,
    ...catalogQueryOptions,
  });
}
