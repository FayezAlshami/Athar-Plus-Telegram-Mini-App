"use client";

import { useTranslations } from "next-intl";
import { Hourglass, MagnifyingGlass } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaymentMethodMark } from "./payment-method-mark";
import { paymentMethodModule } from "./payment-methods/registry";
import { usePaymentMethods } from "./queries";

export function DepositMethodScreen({ code }: { code: string }) {
  const t = useTranslations("deposit");
  const tErrors = useTranslations("errors");
  const { data, isPending, error, refetch } = usePaymentMethods();
  const method = data?.find((candidate) => candidate.code === code);

  if (error) return <PageContainer><PageHeader title={t("title")} /><ErrorState error={error} onRetry={() => refetch()} /></PageContainer>;
  if (isPending) return <PageContainer><PageHeader title={t("title")} /><Skeleton className="h-20 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></PageContainer>;
  if (!method) return <PageContainer><PageHeader title={t("title")} /><EmptyState icon={<MagnifyingGlass />} title={tErrors("notFoundTitle")} body={tErrors("notFoundBody")} /></PageContainer>;

  const { DepositForm } = paymentMethodModule(method.code);

  return (
    <PageContainer>
      <PageHeader title={method.name} />
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <PaymentMethodMark code={method.code} />
        <p dir="auto" className="text-small text-muted-foreground">{method.description}</p>
      </div>

      {method.availability === "available" ? (
        <DepositForm method={method} />
      ) : (
        <EmptyState icon={<Hourglass />} title={t("pendingSpecificationTitle")} body={t("pendingSpecificationBody", { method: method.name })} />
      )}
    </PageContainer>
  );
}
