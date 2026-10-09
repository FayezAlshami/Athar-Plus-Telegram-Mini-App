import { useEffect, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { AppNotification } from "@/entities/notification/types";
import type { Paginated } from "@/entities/shared";
import { accountApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";

const UNDO_MS = 5_000;

type NotificationPage = Paginated<AppNotification> & { meta: { unread_count: number } };
type NotificationCache = InfiniteData<NotificationPage>;

function adjustUnread(page: NotificationPage, delta: number): NotificationPage {
  return { ...page, meta: { ...page.meta, unread_count: Math.max(0, page.meta.unread_count + delta) } };
}

function removeFromCache(current: NotificationCache, id: number): NotificationCache {
  let unreadDelta = 0;
  const pages = current.pages.map((page) => {
    const data = page.data.filter((item) => {
      if (item.id !== id) return true;
      if (!item.read_at) unreadDelta -= 1;
      return false;
    });
    return { ...page, data };
  });
  if (unreadDelta !== 0 && pages[0]) pages[0] = adjustUnread(pages[0], unreadDelta);
  return { ...current, pages };
}

function restoreToCache(current: NotificationCache, notification: AppNotification): NotificationCache {
  const pages = current.pages.map((page) => ({ ...page, data: page.data.filter((item) => item.id !== notification.id) }));
  const first = pages[0] ?? { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0, unread_count: 0 } };
  const index = first.data.findIndex((item) => item.id < notification.id);
  const data = [...first.data];
  data.splice(index === -1 ? data.length : index, 0, notification);
  pages[0] = { ...first, data };
  if (!notification.read_at) pages[0] = adjustUnread(pages[0], 1);
  return { ...current, pages };
}

export function useDismissNotification(onFailed: (error: unknown) => void) {
  const queryClient = useQueryClient();
  const pending = useRef(new Map<number, { timer: number; notification: AppNotification }>());

  useEffect(() => () => {
    for (const [id, entry] of pending.current) {
      window.clearTimeout(entry.timer);
      void accountApi.deleteNotification(id);
    }
    pending.current.clear();
  }, []);

  const write = (recipe: (current: NotificationCache) => NotificationCache) => {
    queryClient.setQueryData<NotificationCache>(queryKeys.notifications, (current) => (current ? recipe(current) : current));
  };

  const restore = (notification: AppNotification) => {
    write((current) => restoreToCache(current, notification));
  };

  return {
    dismiss(notification: AppNotification) {
      if (pending.current.has(notification.id)) return;
      write((current) => removeFromCache(current, notification.id));
      const timer = window.setTimeout(() => {
        pending.current.delete(notification.id);
        void accountApi.deleteNotification(notification.id).then(() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
        }).catch((error: unknown) => {
          restore(notification);
          onFailed(error);
        });
      }, UNDO_MS);
      pending.current.set(notification.id, { timer, notification });
    },
    undo(id: number) {
      const entry = pending.current.get(id);
      if (!entry) return;
      window.clearTimeout(entry.timer);
      pending.current.delete(id);
      restore(entry.notification);
    },
  };
}
