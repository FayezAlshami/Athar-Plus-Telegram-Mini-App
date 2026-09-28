"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BellSimple } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedWords } from "@/components/shared/animated-words";
import { LevelBadge } from "@/components/shared/level-badge";
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
      <Link href="/profile" aria-label={t("nav.profile")} className="shrink-0 rounded-full ring-2 ring-accent-soft ring-offset-2 ring-offset-background">
        <Avatar name={user?.first_name ?? "A"} src={user?.photo_url} />
      </Link>
      <div className="min-w-0 flex-1">
        <AnimatedWords as="h1" text={greeting} className="truncate text-section-title" />
        <p className="truncate text-caption text-muted-foreground">{t("home.greetingSubtitle")}</p>
      </div>
      {user && user.membership.level !== "normal" && <LevelBadge level={user.membership.level} />}
      <Link
        href="/notifications"
        aria-label={unread > 0 ? `${t("nav.notifications")} (${unread})` : t("nav.notifications")}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-sm transition-transform active:scale-95"
      >
        <BellSimple className="size-[22px]" weight={unread > 0 ? "fill" : "regular"} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
