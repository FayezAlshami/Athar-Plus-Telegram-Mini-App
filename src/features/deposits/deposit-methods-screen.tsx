"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CaretRight } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { track } from "@/lib/analytics/events";
import { PaymentMethodMark } from "./payment-method-mark";
import { usePaymentMethods } from "./queries";

export function DepositMethodsScreen() {
  const t = useTranslations("deposit");
  const { data, isPending, error, refetch } = usePaymentMethods();

  useEffect(() => track("deposit_started"), []);

  return (
    <PageContainer>
      <PageHeader title={t("title")} />
      <div>
        <h2 className="text-section-title">{t("chooseMethod")}</h2>
        <p className="text-small text-muted-foreground">{t("chooseMethodBody")}</p>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3" role="status" aria-busy="true">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : (
        <motion.ul variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {data.map((method) => {
            return (
              <motion.li key={method.code} variants={fadeUp}>
                <Card href={`/wallet/deposit/${method.code}`} className="flex items-center gap-4 p-4">
                  <PaymentMethodMark code={method.code} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-card-title">{method.name}</span>
                    {method.description && <span className="block truncate text-small text-muted-foreground">{method.description}</span>}
                  </span>
                  {method.availability !== "available" ? (
                    <Badge tone="gold" className="shrink-0">{t("pendingSpecificationBadge")}</Badge>
                  ) : (
                    <CaretRight aria-hidden className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
                  )}
                </Card>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </PageContainer>
  );
}
