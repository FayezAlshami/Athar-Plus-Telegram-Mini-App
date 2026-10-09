"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, BellSimple, CalendarBlank, CaretLeft, Check, DeviceMobile, Gift, Headset, Heart, IdentificationCard, Plus, Question, Receipt, Star, UsersThree, Wallet } from "@phosphor-icons/react";
import type { MembershipLevelCode } from "@/entities/membership/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatusAvatar } from "@/components/shared/status-avatar";
import { CopyableText } from "@/components/shared/copyable-text";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelSeal } from "@/components/shared/level-seal";
import { Money } from "@/components/shared/money";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { Section } from "@/components/shared/section";
import { fadeUp } from "@/lib/animation/variants";
import { formatDate, formatDateTime, formatTime } from "@/lib/formatting/dates";
import { sharePreparedCard } from "@/features/share/share-card";
import { useHomeScreenShortcut } from "@/lib/telegram/hooks";
import { miniAppDeepLink } from "@/lib/telegram/start-param";
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

const LEVEL_STRIP: Record<MembershipLevelCode, string> = {
  normal: "bg-surface-sunken text-foreground shadow-[inset_0_0_0_1px_var(--border)]",
  essential: "bg-accent-soft text-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_22%,transparent)]",
  plus: "bg-[image:var(--plus-gradient)] text-on-plus",
};

function LevelStrip({ level, expiresAt }: { level: MembershipLevelCode; expiresAt: string | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const hint =
    level === "plus"
      ? expiresAt
        ? t("membership.expiresAt", { date: formatDateTime(expiresAt, locale) })
        : t("profile.levelPlusHint")
      : level === "essential"
        ? t("profile.levelEssentialHint")
        : t("profile.levelNormalHint");

  return (
    <Link
      href="/membership"
      className={cn("relative flex items-center gap-3 overflow-hidden rounded-lg p-3 transition-transform duration-150 active:scale-[0.98]", LEVEL_STRIP[level])}
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white/60 shadow-sm dark:bg-white/10">
        <LevelSeal level={level} size={30} decorative />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-caption", level === "plus" ? "text-on-plus-muted" : "text-muted-foreground")}>{t("membership.yourLevel")}</span>
        <span className={cn("block truncate font-display text-card-title font-semibold", level === "plus" && "text-gold")}>
          {t(`membership.level.${level}`)}
        </span>
        <span className={cn("block truncate text-caption", level === "plus" ? "text-on-plus-muted" : "text-muted-foreground")}>{hint}</span>
      </span>
      <CaretLeft className={cn("size-4 shrink-0 ltr:rotate-180", level === "plus" ? "text-gold" : "text-muted-foreground")} weight="bold" />
    </Link>
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm" role="status" aria-busy="true">
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
  const { data: user, error: profileError, refetch: refetchProfile } = useProfile();
  const wallet = useWallet();
  const notifications = useNotifications();
  const unread = notifications.data?.pages[0]?.meta.unread_count ?? 0;
  const homeScreen = useHomeScreenShortcut();
  const fullName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") : "";

  const shareReferral = () => {
    if (!user?.referral.code) return;
    const fallback = () => {
      if (!BOT_USERNAME) return;
      const url = miniAppDeepLink(BOT_USERNAME, `wallet_r_${user.referral.code}`);
      const share = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("profile.shareReferral"))}`;
      if (telegram.status === "ready") telegram.adapter.openTelegramLink(share);
      else window.open(share, "_blank", "noopener,noreferrer");
    };
    if (telegram.status !== "ready") {
      fallback();
      return;
    }
    void sharePreparedCard(telegram.adapter, { type: "referral" }, fallback);
  };

  const openSupport = () => {
    if (!BOT_USERNAME) return;
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

          <div className="relative flex flex-col items-center gap-2 text-center">
            <StatusAvatar name={user.first_name} src={user.photo_url} size={72} availableLabel={t("home.available")} />
            <div className="flex max-w-full items-center justify-center gap-1.5">
              <p dir="auto" className="min-w-0 truncate font-display text-section-title">{fullName}</p>
              <LevelSeal level={user.membership.level} size={22} />
              {user.telegram_is_premium && <Star className="size-4 shrink-0 text-gold" weight="fill" aria-label={t("profile.telegramPremium")} />}
            </div>
            {user.username && (
              <CopyableText
                value={`@${user.username}`}
                label={t("common.copy")}
                className="inline-flex max-w-full items-center rounded-full bg-accent-soft px-3 py-1 text-small font-medium text-accent active:opacity-80"
              >
                <bdi dir="ltr" className="truncate">@{user.username}</bdi>
              </CopyableText>
            )}
          </div>

          {user.member_since && (
            <div className="flex min-h-12 items-center gap-2.5 rounded-md bg-surface-sunken px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--border)]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <CalendarBlank className="size-[18px]" weight="duotone" aria-hidden />
              </span>
              <span className="shrink-0 text-caption font-medium text-muted-foreground">{t("profile.memberSinceLabel")}</span>
              <span className="min-w-0 flex-1 text-end leading-tight">
                <bdi dir="ltr" className="block truncate text-small font-semibold tabular-nums text-foreground">
                  {formatDate(user.member_since, locale)}
                </bdi>
                <bdi dir="ltr" className="block truncate text-caption tabular-nums text-muted-foreground">
                  {formatTime(user.member_since, locale)}
                </bdi>
              </span>
            </div>
          )}

          <LevelStrip level={user.membership.level} expiresAt={user.membership.expires_at} />

          <div className="relative flex h-12 items-center gap-2.5 rounded-md bg-surface-sunken ps-3 pe-1 shadow-[inset_0_0_0_1px_var(--border)]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
              <IdentificationCard className="size-4" weight="duotone" aria-hidden />
            </span>
            <span className="text-caption font-medium text-muted-foreground">{t("profile.telegramId")}</span>
            <span className="min-w-0 flex-1 truncate text-end font-display text-small font-semibold tabular-nums">
              <bdi dir="ltr">{user.telegram_id}</bdi>
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
      ) : profileError ? (
        <ErrorState error={profileError} onRetry={() => refetchProfile()} />
      ) : (
        <ProfileCardSkeleton />
      )}

      <Section title={t("profile.account")} tone="caption">
        <ListGroup inset>
          <ListItem variant="settings" href="/orders" iconTone="accent" icon={<Receipt weight="duotone" />} title={t("nav.orders")} />
          <ListItem variant="settings" href="/wallet" iconTone="accent" icon={<Wallet weight="duotone" />} title={t("nav.wallet")} />
          <ListItem variant="settings" href="/gift-codes" iconTone="gold" icon={<Gift weight="duotone" />} title={t("giftCode.title")} />
          <ListItem variant="settings" href="/favorites" iconTone="danger" icon={<Heart weight="fill" />} title={t("profile.favorites")} />
          <ListItem variant="settings" href="/faq" iconTone="neutral" icon={<Question weight="duotone" />} title={t("profile.faq")} />
        </ListGroup>
      </Section>

      {user?.referral.code && (
        <Section title={t("profile.rewards")} tone="caption">
          <ListGroup inset>
            <ListItem
              variant="settings"
              iconTone="accent"
              icon={<UsersThree weight="duotone" />}
              title={t("profile.referrals")}
              subtitle={t("profile.referralStats", { signups: user.referral.signups, orders: user.referral.orders })}
              onClick={shareReferral}
              showChevron
            />
          </ListGroup>
        </Section>
      )}

      <Section title={t("profile.preferences")} tone="caption">
        <ListGroup inset>
          <LanguageSwitch />
          <ThemeSwitch />
        </ListGroup>
      </Section>

      <Section title={t("profile.app")} tone="caption">
        <ListGroup inset>
          <ListItem
            variant="settings"
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
          {(homeScreen.status === "missed" || homeScreen.status === "unknown") && (
            <ListItem
              variant="settings"
              iconTone="accent"
              icon={<DeviceMobile weight="duotone" />}
              title={t("profile.addToHome")}
              subtitle={t("profile.addToHomeHint")}
              onClick={homeScreen.add}
              showChevron
            />
          )}
          {homeScreen.status === "added" && (
            <ListItem variant="settings" iconTone="success" icon={<Check weight="bold" />} title={t("profile.addedToHome")} />
          )}
        </ListGroup>
      </Section>

      {BOT_USERNAME && (
        <ListGroup inset>
          <ListItem variant="settings" iconTone="success" icon={<Headset weight="duotone" />} title={t("profile.support")} subtitle={<bdi dir="ltr">@{BOT_USERNAME}</bdi>} onClick={openSupport} showChevron />
        </ListGroup>
      )}

      <p className="text-center text-caption text-muted-foreground/80">{t("app.name")} · {t("app.tagline")}</p>
    </PageContainer>
  );
}
