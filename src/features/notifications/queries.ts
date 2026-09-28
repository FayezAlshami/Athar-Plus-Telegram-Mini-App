import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { privateQueryOptions } from "@/lib/query/policy";

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  return useInfiniteQuery({
    ...privateQueryOptions,
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam, signal }) => accountApi.notifications(pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined,
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => accountApi.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
