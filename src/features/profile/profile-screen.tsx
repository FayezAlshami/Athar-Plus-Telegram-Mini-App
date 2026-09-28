"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { BellSimple, Crown, Gift, Headset, Heart, Receipt, Wallet } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelBadge } from "@/components/shared/level-badge";
import { Money } from "@/components/shared/money";
import { CopyButton } from "@/components/shared/copy-button";
import { ButterflyMark } from "@/components/shared/butterfly";
import { Section } from "@/components/shared/section";
import { formatDateTime } from "@/lib/formatting/dates";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { useProfile } from "@/features/memberships/queries";
import { useWallet } from "@/features/wallet/queries";
import { LanguageSwitch } from "./language-switch";
import { ThemeSwitch } from "./theme-switch";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export function ProfileScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const telegram = useTelegramState();
  const { data: user } = useProfile();
  const wallet = useWallet();

  return (
    <PageContainer>
      <PageHeader title={t("profile.title")} />

      {user ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar name={user.first_name} src={user.photo_url} size={56} />
            <div className="min-w-0 flex-1">
              <p dir="auto" className="truncate text-section-title">{[user.first_name, user.last_name].filter(Boolean).join(" ")}</p>
              {user.username && <p className="text-small text-muted-foreground" dir="ltr">@{user.username}</p>}
              {user.member_since && (
                <p className="text-caption text-muted-foreground">{t("profile.memberSince", { date: formatDateTime(user.member_since, locale) })}</p>
              )}
            </div>
            <LevelBadge level={user.membership.level} />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <span className="text-caption text-muted-foreground">{t("profile.telegramId")}</span>
            <span className="flex min-w-0 items-center gap-1">
              <span dir="ltr" className="truncate text-small font-medium tabular-nums">{user.telegram_id}</span>
              <CopyButton value={String(user.telegram_id)} className="size-8" />
            </span>
          </div>
        </div>
      ) : (
        <Skeleton className="h-24 rounded-xl" />
      )}

      <div className="grid grid-cols-2 overflow-hidden rounded-xl shadow-md">
        <Link href="/wallet" className="relative min-h-[132px] bg-[image:var(--hero-gradient)] p-4 text-white">
          <ButterflyMark className="pointer-events-none absolute -bottom-7 -end-5 size-28 text-white/10" />
          <span className="inline-flex items-center gap-1.5 text-caption text-white/75">
            <Wallet className="size-4" weight="duotone" />
            {t("profile.balance")}
          </span>
          {wallet.data ? (
            <Money amountMinor={wallet.data.balance_minor} currency={wallet.data.currency} className="relative mt-2 block text-[1.65rem] leading-none text-white" />
          ) : (
            <Skeleton className="relative mt-3 h-8 w-24 bg-white/15" />
          )}
          <span className="relative mt-4 inline-flex text-caption font-medium text-white/80">{t("wallet.deposit")}</span>
        </Link>
        <Link href="/orders" className="relative min-h-[132px] border-s border-border bg-surface p-4">
          <span className="absolute inset-y-4 start-0 w-1 rounded-full bg-accent" />
          <span className="text-caption text-muted-foreground">{t("profile.totalSpent")}</span>
          {user ? (
            <Money amountMinor={user.spent_minor} currency={user.currency} className="mt-2 block text-[1.65rem] leading-none" />
          ) : (
            <Skeleton className="mt-3 h-8 w-24" />
          )}
          <span className="mt-4 block text-caption text-muted-foreground">{t("profile.spentNote")}</span>
        </Link>
      </div>

      <Section title={t("profile.shortcuts")}>
        <ListGroup>
          <ListItem href="/favorites" icon={<Heart className="text-danger" weight="fill" />} title={t("profile.favorites")} />
          <ListItem href="/membership" icon={<Crown className="text-gold" weight="fill" />} title={t("membership.title")} />
          <ListItem href="/orders" icon={<Receipt />} title={t("nav.orders")} />
          <ListItem href="/wallet" icon={<Wallet />} title={t("nav.wallet")} />
          <ListItem href="/gift-codes" icon={<Gift />} title={t("giftCode.title")} />
          <ListItem href="/notifications" icon={<BellSimple />} title={t("notifications.title")} />
        </ListGroup>
      </Section>

      <Section title={t("profile.preferences")}>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <p className="px-4 pt-3 text-small font-medium text-muted-foreground">{t("profile.language")}</p>
          <LanguageSwitch />
          <p className="border-t border-border px-4 pt-3 text-small font-medium text-muted-foreground">{t("profile.theme")}</p>
          <ThemeSwitch />
        </div>
      </Section>

      {BOT_USERNAME && (
        <ListGroup>
          <ListItem
            icon={<Headset />}
            title={t("profile.support")}
            onClick={() => {
              const url = `https://t.me/${BOT_USERNAME}`;
              if (telegram.status === "ready") telegram.adapter.openTelegramLink(url);
              else window.open(url, "_blank", "noopener,noreferrer");
            }}
            showChevron
          />
        </ListGroup>
      )}
    </PageContainer>
  );
}
