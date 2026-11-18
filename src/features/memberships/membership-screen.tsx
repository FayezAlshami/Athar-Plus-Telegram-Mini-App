"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CheckCircle, Sparkle } from "@phosphor-icons/react";
import type { MembershipLevel } from "@/entities/membership/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { LevelBadge } from "@/components/shared/level-badge";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { formatDateTime } from "@/lib/formatting/dates";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/cn";
import { PlusCard } from "./plus-card";
import { useMembership } from "./queries";

function DiscountSentence({ basis }: { basis: number }) {
  const t = useTranslations("membership");
  const locale = useLocale();
  if (basis <= 0) return t("noGeneralDiscount");
  const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(basis / 100);
  return t("generalDiscount", { percent });
}

function LevelCard({ level, current }: { level: MembershipLevel; current: boolean }) {
  const t = useTranslations();
  const merchant = level.code === "merchant";
  return (
    <motion.li
      variants={fadeUp}
      className={cn(
        "rounded-lg border bg-surface p-4",
        current && merchant && "border-info shadow-md",
        current && !merchant && "border-accent shadow-md",
        !current && "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <LevelBadge level={level.code} />
        {current && <span className={cn("text-caption", merchant ? "text-info" : "text-accent")}>{t("common.currentPlan")}</span>}
      </div>
      <p className="mt-3 text-base"><DiscountSentence basis={level.discount_basis_points} /></p>
      {level.description && <p className="mt-2 text-small text-muted-foreground">{level.description}</p>}
      {level.benefits.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {level.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-small">
              <CheckCircle className={cn("size-4 shrink-0", merchant ? "text-info" : "text-accent")} weight="fill" />
              {benefit}
            </li>
          ))}
        </ul>
      )}
    </motion.li>
  );
}

function MerchantHero({ basis }: { basis: number }) {
  const t = useTranslations("membership");
  const locale = useLocale();
  const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(basis / 100);
  return (
    <section className="rounded-xl bg-info-soft p-5">
      <LevelBadge level="merchant" />
      {basis > 0 ? (
        <>
          <p className="mt-3 font-display text-3xl font-semibold tabular text-info">{percent}%</p>
          <p className="text-small text-muted-foreground">{t("onEverything")}</p>
        </>
      ) : (
        <p className="mt-3 text-small text-muted-foreground">{t("noGeneralDiscount")}</p>
      )}
    </section>
  );
}

export function MembershipScreen() {
  const t = useTranslations("membership");
  const locale = useLocale();
  const { data, isPending, error, refetch } = useMembership();

  useEffect(() => track("plus_viewed"), []);

  return (
    <PageContainer>
      <PageHeader title={t("title")} />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <><Skeleton className="h-36 rounded-xl" /><Skeleton className="h-28 rounded-lg" /></>
      ) : (
        <>
          {data.current_level === "merchant" ? (
            <MerchantHero basis={data.levels.find((level) => level.code === "merchant")?.discount_basis_points ?? 0} />
          ) : (
            <PlusCard title={t("level.plus")}>
              <p className="text-small text-on-plus-muted">
                {data.current_level === "plus" && data.expires_at
                  ? t("expiresAt", { date: formatDateTime(data.expires_at, locale) })
                  : data.levels.find((level) => level.code === "plus")?.description}
              </p>
            </PlusCard>
          )}

          <motion.ul variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {data.levels.map((level) => (
              <LevelCard key={level.code} level={level} current={level.code === data.current_level} />
            ))}
          </motion.ul>

          {data.current_level !== "plus" && data.current_level !== "merchant" && (
            <div className="flex gap-3 rounded-lg bg-gold-soft p-4">
              <Sparkle className="size-6 shrink-0 text-gold" weight="fill" />
              <div>
                <p className="text-card-title">{t("howToUpgrade")}</p>
                <p className="text-small text-muted-foreground">{t("howToUpgradeBody")}</p>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
