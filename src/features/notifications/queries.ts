import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { privateQueryOptions } from "@/lib/query/policy";
import { useTelegramActive } from "@/lib/telegram/telegram-provider";

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  const active = useTelegramActive();
  return useInfiniteQuery({
    ...privateQueryOptions,
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam, signal }) => accountApi.notifications(pageParam, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined,
    refetchInterval: active ? POLL_INTERVAL_MS : false,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => accountApi.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
