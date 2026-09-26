"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { track } from "@/lib/analytics/events";
import { paymentMethodModule } from "./payment-methods/registry";
import { usePaymentMethods } from "./queries";

export function DepositMethodsScreen() {
  const t = useTranslations("deposit");
  const { data, isPending, error, refetch } = usePaymentMethods();

  useEffect(() => track("deposit_started"), []);

  return (
    <PageContainer withNav={false}>
      <PageHeader title={t("title")} />
      <div>
        <h2 className="text-section-title">{t("chooseMethod")}</h2>
        <p className="text-small text-muted-foreground">{t("chooseMethodBody")}</p>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : (
        <motion.ul variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {data.map((method) => {
            const { icon: Icon } = paymentMethodModule(method.code);
            return (
              <motion.li key={method.code} variants={fadeUp}>
                <Card href={`/wallet/deposit/${method.code}`} className="flex items-center gap-4 p-4">
                  <span className="flex size-12 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <Icon className="size-6" weight="duotone" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-card-title">{method.name}</span>
                    {method.description && <span className="block truncate text-small text-muted-foreground">{method.description}</span>}
                  </span>
                  {method.availability !== "available" && <Badge tone="gold">{t("pendingSpecificationBadge")}</Badge>}
                </Card>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </PageContainer>
  );
}
