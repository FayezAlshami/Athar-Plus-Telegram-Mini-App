import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { AppNotification } from "@/entities/notification/types";
import type { Paginated } from "@/entities/shared";
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

type NotificationPage = Paginated<AppNotification> & { meta: { unread_count: number } };
type NotificationCache = InfiniteData<NotificationPage>;

function patchNotificationCache(
  current: NotificationCache,
  id: number,
  patch: (item: AppNotification) => AppNotification,
): NotificationCache {
  let unreadDelta = 0;
  const pages = current.pages.map((page) => ({
    ...page,
    data: page.data.map((item) => {
      if (item.id !== id) return item;
      const wasUnread = !item.read_at;
      const next = patch(item);
      if (wasUnread && next.read_at) unreadDelta -= 1;
      return next;
    }),
  }));
  if (unreadDelta !== 0 && pages[0]) {
    pages[0] = { ...pages[0], meta: { ...pages[0].meta, unread_count: Math.max(0, pages[0].meta.unread_count + unreadDelta) } };
  }
  return { ...current, pages };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountApi.markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = queryClient.getQueryData<NotificationCache>(queryKeys.notifications);
      queryClient.setQueryData<NotificationCache>(queryKeys.notifications, (current) =>
        current ? patchNotificationCache(current, id, (item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })) : current,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.notifications, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
