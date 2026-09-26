import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

const POLL_INTERVAL_MS = 60_000;

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ signal }) => accountApi.notifications(1, { signal }),
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
