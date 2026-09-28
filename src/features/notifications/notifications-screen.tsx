"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { BellSimple, Crown, Gift, Megaphone, Receipt, Wallet, type Icon } from "@phosphor-icons/react";
import type { AppNotification } from "@/entities/notification/types";
import type { Locale } from "@/lib/i18n/config";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { formatRelative } from "@/lib/formatting/dates";
import { cn } from "@/lib/cn";
import { LoadMore } from "@/components/shared/load-more";
import { useMarkAllNotificationsRead, useNotifications } from "./queries";

const TYPE_ICON: Record<AppNotification["type"], Icon> = {
  order_status: Receipt,
  deposit_status: Wallet,
  gift_code_redeemed: Gift,
  membership_changed: Crown,
  promotion: Megaphone,
};

export function NotificationsScreen() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const { data, isPending, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const items = data?.pages.flatMap((page) => page.data) ?? [];
  const unread = data?.pages[0]?.meta.unread_count ?? 0;

  return (
    <PageContainer withNav={false}>
      <PageHeader
        title={t("title")}
        trailing={
          data && unread > 0 ? (
            <Button size="sm" variant="ghost" loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
              {t("markAllRead")}
            </Button>
          ) : null
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-2">
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
            <NotificationRow key={notification.id} notification={notification} locale={locale} />
          ))}
        </motion.ul>
        <LoadMore hasNext={Boolean(hasNextPage)} isFetching={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
        </>
      )}
    </PageContainer>
  );
}

function NotificationRow({ notification, locale }: { notification: AppNotification; locale: Locale }) {
  const Icon = TYPE_ICON[notification.type] ?? BellSimple;
  const unread = !notification.read_at;

  return (
    <motion.li
      variants={fadeUp}
      className={cn("relative flex gap-3 rounded-lg border p-4 shadow-sm", unread ? "border-accent/30 bg-accent-soft" : "border-border bg-surface")}
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", unread ? "bg-accent text-accent-foreground" : "bg-surface-sunken text-muted-foreground")}>
        <Icon className="size-5" weight="duotone" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-card-title" dir="auto">{notification.title}</p>
          <span className="shrink-0 text-caption text-muted-foreground">{formatRelative(notification.created_at, locale)}</span>
        </div>
        {notification.body && <p className="mt-1 whitespace-pre-line text-small text-muted-foreground" dir="auto">{notification.body}</p>}
      </div>
      {unread && <span aria-hidden className="absolute end-2 top-2 size-2 rounded-full bg-accent" />}
    </motion.li>
  );
}
