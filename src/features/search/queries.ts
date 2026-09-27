import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { catalogQueryOptions } from "@/lib/query/policy";

export const MIN_SEARCH_LENGTH = 2;

export function useCatalogSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.search(trimmed),
    queryFn: ({ signal }) => catalogApi.search(trimmed, { signal }),
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
    ...catalogQueryOptions,
  });
}
