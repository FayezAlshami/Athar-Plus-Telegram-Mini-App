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
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { formatRelative } from "@/lib/formatting/dates";
import { cn } from "@/lib/cn";
import { useMarkAllNotificationsRead, useNotifications } from "./queries";

export function NotificationsScreen() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const { data, isPending, error, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <PageContainer withNav={false}>
      <PageHeader
        title={t("title")}
        trailing={
          data && data.meta.unread_count > 0 ? (
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
      ) : data.data.length === 0 ? (
        <EmptyState icon={<BellSimple />} title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <motion.ul variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-2">
          {data.data.map((notification) => (
            <motion.li
              key={notification.id}
              variants={fadeUp}
              className={cn("rounded-lg border p-4", notification.read_at ? "border-border bg-surface" : "border-accent/30 bg-accent-soft")}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-card-title" dir="auto">{notification.title}</p>
                <span className="shrink-0 text-caption text-muted-foreground">{formatRelative(notification.created_at, locale)}</span>
              </div>
              {notification.body && <p className="mt-1 text-small text-muted-foreground" dir="auto">{notification.body}</p>}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </PageContainer>
  );
}
