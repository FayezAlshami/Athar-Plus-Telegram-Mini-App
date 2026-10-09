"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { BellSimple } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { listContainer } from "@/lib/animation/variants";
import { toast } from "@/components/ui/toast";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { isLocale } from "@/lib/i18n/config";
import { useHaptics } from "@/lib/telegram/hooks";
import { LoadMore } from "@/components/shared/load-more";
import { NotificationRow } from "./notification-row";
import { useMarkAllNotificationsRead, useNotifications } from "./queries";
import { useDismissNotification } from "./use-dismiss-notification";

export function NotificationsScreen() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const haptics = useHaptics();
  const { data, isPending, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const dismiss = useDismissNotification((failure) => toast.error(errorMessage(failure)));
  const items = data?.pages.flatMap((page) => page.data) ?? [];
  const unread = data?.pages[0]?.meta.unread_count ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        trailing={
          data && unread > 0 ? (
            <Button size="sm" variant="ghost" className="-me-2 text-accent" loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
              {t("markAllRead")}
            </Button>
          ) : null
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-2" role="status" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<BellSimple />} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <>
          <motion.ul variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-2">
            {items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                locale={isLocale(locale) ? locale : "ar"}
                dismissLabel={t("dismiss")}
                onDismiss={(item) => {
                  haptics.selection();
                  dismiss.dismiss(item);
                  toast(t("dismissed"), {
                    duration: 5_000,
                    action: { label: tCommon("undo"), onClick: () => dismiss.undo(item.id) },
                  });
                }}
              />
            ))}
          </motion.ul>
          <LoadMore hasNext={Boolean(hasNextPage)} isFetching={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
        </>
      )}
    </PageContainer>
  );
}

