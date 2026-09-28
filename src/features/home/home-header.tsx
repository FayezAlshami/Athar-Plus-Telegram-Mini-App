"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BellSimple } from "@phosphor-icons/react";
import { BackButton } from "@/components/layout/back-button";
import { Avatar } from "@/components/ui/avatar";
import { LevelBadge } from "@/components/shared/level-badge";
import { SplitHeadline } from "@/components/motion/split-headline";
import { useAuth } from "@/features/auth/auth-provider";
import { useNotifications } from "@/features/notifications/queries";

export function HomeHeader() {
  const t = useTranslations();
  const { user } = useAuth();
  const notifications = useNotifications();
  const unread = notifications.data?.pages[0]?.meta.unread_count ?? 0;
  const greeting = t("home.greeting", { name: user?.first_name ?? "" });

  return (
    <header className="flex items-center gap-3">
      <BackButton />
      <Link href="/profile" aria-label={t("nav.profile")}>
        <Avatar name={user?.first_name ?? "A"} src={user?.photo_url} />
      </Link>
      <div className="min-w-0 flex-1">
        <SplitHeadline text={greeting} className="truncate text-card-title" />
        <p className="text-caption text-muted-foreground">{t("home.greetingSubtitle")}</p>
      </div>
      {user && user.membership.level !== "normal" && <LevelBadge level={user.membership.level} />}
      <Link
        href="/notifications"
        aria-label={t("nav.notifications")}
        className="relative flex size-11 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-sm"
      >
        <BellSimple className="size-[22px]" />
        {unread > 0 && <span className="absolute top-2.5 end-2.5 size-2 rounded-full bg-accent ring-2 ring-surface-elevated" />}
      </Link>
    </header>
  );
}
