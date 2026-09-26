"use client";

import { useLocale, useTranslations } from "next-intl";
import { BellSimple, Crown, Gift, Headset, Receipt, Wallet } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelBadge } from "@/components/shared/level-badge";
import { Section } from "@/components/shared/section";
import { formatDateTime } from "@/lib/formatting/dates";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { useProfile } from "@/features/memberships/queries";
import { LanguageSwitch } from "./language-switch";
import { ThemeSwitch } from "./theme-switch";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export function ProfileScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const telegram = useTelegramState();
  const { data: user } = useProfile();

  return (
    <PageContainer>
      <PageHeader title={t("profile.title")} showBack={false} />

      {user ? (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
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
      ) : (
        <Skeleton className="h-24 rounded-xl" />
      )}

      <Section title={t("profile.shortcuts")}>
        <ListGroup>
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
