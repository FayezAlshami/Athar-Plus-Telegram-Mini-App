"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CalendarCheck, Key, Scroll, ShieldCheck } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { ServicePeriod } from "@/entities/product/types";
import type { StructuredTextBlock } from "@/entities/shared";
import { StructuredText } from "@/components/shared/structured-text";
import { fadeUp } from "@/lib/animation/variants";
import { formatPeriod } from "@/lib/formatting/period";

export function ServiceFacts({
  isSubscription,
  subscriptionPeriod,
  warrantyPeriod,
  activation,
  terms,
}: {
  isSubscription: boolean;
  subscriptionPeriod: ServicePeriod | null;
  warrantyPeriod: ServicePeriod | null;
  activation: StructuredTextBlock[];
  terms: StructuredTextBlock[];
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const facts = [
    isSubscription && subscriptionPeriod
      ? { key: "duration", icon: <CalendarCheck className="size-5" weight="duotone" />, label: t("subscriptionDuration"), value: formatPeriod(subscriptionPeriod.count, subscriptionPeriod.unit, locale) }
      : null,
    warrantyPeriod
      ? { key: "warranty", icon: <ShieldCheck className="size-5" weight="duotone" />, label: t("warranty"), value: formatPeriod(warrantyPeriod.count, warrantyPeriod.unit, locale) }
      : null,
  ].filter((item) => item !== null);

  if (facts.length === 0 && activation.length === 0 && terms.length === 0) return null;

  return (
    <motion.section variants={fadeUp} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <h2 className="text-section-title">{t("serviceTitle")}</h2>
      {facts.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {facts.map((fact) => (
            <li key={fact.key} className="flex items-center gap-3 rounded-lg bg-surface-sunken px-3 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent">{fact.icon}</span>
              <span className="min-w-0">
                <span className="block text-caption text-muted-foreground">{fact.label}</span>
                <span className="text-card-title">{fact.value}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {activation.length > 0 && <Policy icon={<Key className="size-5" weight="duotone" />} title={t("activation")}><StructuredText blocks={activation} /></Policy>}
      {terms.length > 0 && <Policy icon={<Scroll className="size-5" weight="duotone" />} title={t("terms")}><StructuredText blocks={terms} /></Policy>}
    </motion.section>
  );
}

function Policy({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="flex items-center gap-2 text-card-title">
        <span className="text-accent">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
