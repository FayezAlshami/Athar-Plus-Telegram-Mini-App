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

function LevelCard({ level, current }: { level: MembershipLevel; current: boolean }) {
  const t = useTranslations();
  return (
    <motion.li
      variants={fadeUp}
      className={cn("rounded-lg border bg-surface p-4", current ? "border-accent shadow-md" : "border-border")}
    >
      <div className="flex items-center justify-between">
        <LevelBadge level={level.code} />
        {current && <span className="text-caption text-accent">{t("common.currentPlan")}</span>}
      </div>
      {level.description && <p className="mt-2 text-small text-muted-foreground">{level.description}</p>}
      {level.benefits.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {level.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-small">
              <CheckCircle className="size-4 shrink-0 text-accent" weight="fill" />
              {benefit}
            </li>
          ))}
        </ul>
      )}
    </motion.li>
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
          <PlusCard title={t("level.plus")}>
            <p className="text-small text-on-plus-muted">
              {data.current_level === "plus" && data.expires_at
                ? t("expiresAt", { date: formatDateTime(data.expires_at, locale) })
                : data.levels.find((level) => level.code === "plus")?.description}
            </p>
          </PlusCard>

          <motion.ul variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {data.levels.map((level) => (
              <LevelCard key={level.code} level={level} current={level.code === data.current_level} />
            ))}
          </motion.ul>

          {data.current_level !== "plus" && (
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
