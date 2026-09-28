"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, BellSimple, Crown, Gift, Headset, Heart, Plus, Receipt, Wallet } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelBadge } from "@/components/shared/level-badge";
import { Money } from "@/components/shared/money";
import { CopyButton } from "@/components/shared/copy-button";
import { Section } from "@/components/shared/section";
import { fadeUp } from "@/lib/animation/variants";
import { formatDateTime } from "@/lib/formatting/dates";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { useProfile } from "@/features/memberships/queries";
import { useNotifications } from "@/features/notifications/queries";
import { useWallet } from "@/features/wallet/queries";
import { cn } from "@/lib/cn";
import { LanguageSwitch } from "./language-switch";
import { ThemeSwitch } from "./theme-switch";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

function StatTile({
  href,
  label,
  hint,
  tone,
  children,
}: {
  href: string;
  label: string;
  hint: ReactNode;
  tone: "accent" | "neutral";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[104px] flex-col justify-between gap-3 rounded-lg p-3.5 transition-transform duration-150 active:scale-[0.98]",
        tone === "accent" ? "bg-accent-soft" : "bg-surface-sunken",
      )}
    >
      <span className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
        {label}
        {hint}
      </span>
      {children}
    </Link>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 rounded-md" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-[104px] rounded-lg" />
        <Skeleton className="h-[104px] rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const telegram = useTelegramState();
  const { data: user } = useProfile();
  const wallet = useWallet();
  const notifications = useNotifications();
  const unread = notifications.data?.pages[0]?.meta.unread_count ?? 0;
  const fullName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "";

  const openSupport = () => {
    const url = `https://t.me/${BOT_USERNAME}`;
    if (telegram.status === "ready") telegram.adapter.openTelegramLink(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PageContainer>
      <PageHeader title={t("profile.title")} />

      {user ? (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          aria-label={fullName}
          className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-accent-soft to-transparent" />

          <div className="relative flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-surface p-1 shadow-sm ring-1 ring-border">
              <Avatar name={user.first_name} src={user.photo_url} size={64} className="text-xl" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p dir="auto" className="min-w-0 truncate text-section-title">{fullName}</p>
                <LevelBadge level={user.membership.level} />
              </div>
              {user.username && (
                <p dir="ltr" className="truncate text-start text-small font-medium text-accent">@{user.username}</p>
              )}
              {user.member_since && (
                <p className="mt-0.5 truncate text-caption text-muted-foreground">
                  {t("profile.memberSince", { date: formatDateTime(user.member_since, locale) })}
                </p>
              )}
            </div>
          </div>

          <div className="relative flex h-11 items-center gap-2 rounded-md border border-border bg-surface-sunken ps-3.5 pe-1">
            <span className="text-caption font-medium text-muted-foreground">{t("profile.telegramId")}</span>
            <span dir="ltr" className="min-w-0 flex-1 truncate text-end font-display text-small font-semibold tabular-nums">
              {user.telegram_id}
            </span>
            <CopyButton value={String(user.telegram_id)} />
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <StatTile
              href="/wallet"
              tone="accent"
              label={t("profile.balance")}
              hint={
                <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Plus className="size-3.5" weight="bold" />
                </span>
              }
            >
              {wallet.data ? (
                <Money amountMinor={wallet.data.balance_minor} currency={wallet.data.currency} className="self-start text-[1.75rem] font-bold leading-none text-accent" />
              ) : (
                <Skeleton className="h-7 w-20" />
              )}
            </StatTile>
            <StatTile
              href="/orders"
              tone="neutral"
              label={t("profile.totalSpent")}
              hint={<ArrowUpRight className="size-4 rtl:-scale-x-100" weight="bold" />}
            >
              <Money amountMinor={user.spent_minor} currency={user.currency} className="self-start text-[1.75rem] font-bold leading-none text-foreground" />
            </StatTile>
          </div>
        </motion.section>
      ) : (
        <ProfileCardSkeleton />
      )}

      <Section title={t("profile.shortcuts")}>
        <ListGroup>
          <ListItem href="/favorites" iconTone="danger" icon={<Heart weight="fill" />} title={t("profile.favorites")} />
          <ListItem href="/membership" iconTone="gold" icon={<Crown weight="fill" />} title={t("membership.title")} />
          <ListItem href="/orders" iconTone="accent" icon={<Receipt weight="duotone" />} title={t("nav.orders")} />
          <ListItem href="/wallet" iconTone="accent" icon={<Wallet weight="duotone" />} title={t("nav.wallet")} />
          <ListItem href="/gift-codes" iconTone="gold" icon={<Gift weight="duotone" />} title={t("giftCode.title")} />
          <ListItem
            href="/notifications"
            iconTone="neutral"
            icon={<BellSimple weight="duotone" />}
            title={t("notifications.title")}
            trailing={
              unread > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-danger px-1.5 text-caption font-semibold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : undefined
            }
          />
        </ListGroup>
      </Section>

      <Section title={t("profile.preferences")}>
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <p className="px-4 pt-3 text-small font-medium text-muted-foreground">{t("profile.language")}</p>
          <LanguageSwitch />
          <p className="border-t border-border px-4 pt-3 text-small font-medium text-muted-foreground">{t("profile.theme")}</p>
          <ThemeSwitch />
        </div>
      </Section>

      {BOT_USERNAME && (
        <ListGroup>
          <ListItem iconTone="success" icon={<Headset weight="duotone" />} title={t("profile.support")} subtitle={<bdi dir="ltr">@{BOT_USERNAME}</bdi>} onClick={openSupport} showChevron />
        </ListGroup>
      )}

      <p className="text-center text-caption text-muted-foreground/80">{t("app.name")} · {t("app.tagline")}</p>
    </PageContainer>
  );
}
