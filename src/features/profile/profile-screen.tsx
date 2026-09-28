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
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar name={user.first_name} src={user.photo_url} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p dir="auto" className="truncate text-section-title">{[user.first_name, user.last_name].filter(Boolean).join(" ")}</p>
                  {user.username && <p className="text-small text-accent" dir="ltr">@{user.username}</p>}
                </div>
                <LevelBadge level={user.membership.level} />
              </div>
              {user.member_since && (
                <p className="mt-0.5 text-caption text-muted-foreground">{t("profile.memberSince", { date: formatDateTime(user.member_since, locale) })}</p>
              )}
              <span className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1.5">
                <CopyButton value={String(user.telegram_id)} className="size-7 shrink-0" />
                <span dir="ltr" className="truncate text-caption font-medium tabular-nums text-foreground">
                  {t("profile.idLabel")}: {user.telegram_id}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/wallet"
              className="flex min-h-[92px] flex-col justify-between rounded-xl bg-accent-soft p-3.5 transition-transform active:scale-[0.98]"
            >
              <span className="text-caption font-medium text-muted-foreground">{t("profile.balance")}</span>
              {wallet.data ? (
                <Money amountMinor={wallet.data.balance_minor} currency={wallet.data.currency} className="self-start text-[1.75rem] font-bold leading-none text-accent" />
              ) : (
                <Skeleton className="h-8 w-20" />
              )}
            </Link>
            <Link
              href="/orders"
              className="flex min-h-[92px] flex-col justify-between rounded-xl bg-accent-soft p-3.5 transition-transform active:scale-[0.98]"
            >
              <span className="text-caption font-medium text-muted-foreground">{t("profile.totalSpent")}</span>
              <Money amountMinor={user.spent_minor} currency={user.currency} className="self-start text-[1.75rem] font-bold leading-none text-accent" />
            </Link>
          </div>
        </div>
      ) : (
        <Skeleton className="h-40 rounded-xl" />
      )}

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
