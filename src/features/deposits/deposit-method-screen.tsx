"use client";

import { useTranslations } from "next-intl";
import { Hourglass } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { paymentMethodModule } from "./payment-methods/registry";
import { usePaymentMethods } from "./queries";

export function DepositMethodScreen({ code }: { code: string }) {
  const t = useTranslations("deposit");
  const { data, isPending, error, refetch } = usePaymentMethods();
  const method = data?.find((candidate) => candidate.code === code);

  if (error) return <PageContainer withNav={false}><ErrorState error={error} onRetry={() => refetch()} /></PageContainer>;
  if (isPending) return <PageContainer withNav={false}><Skeleton className="h-11 w-40" /><Skeleton className="h-48 rounded-lg" /></PageContainer>;
  if (!method) return <PageContainer withNav={false}><PageHeader title={t("title")} /><ErrorState error={null} /></PageContainer>;

  const { icon: Icon, DepositForm } = paymentMethodModule(method.code);

  return (
    <PageContainer withNav={false}>
      <PageHeader title={method.name} />
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <span className="flex size-12 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Icon className="size-6" weight="duotone" />
        </span>
        <p className="text-small text-muted-foreground">{method.description}</p>
      </div>

      {method.availability === "available" ? (
        <DepositForm method={method} />
      ) : (
        <EmptyState icon={<Hourglass />} title={t("pendingSpecificationTitle")} body={t("pendingSpecificationBody", { method: method.name })} />
      )}
    </PageContainer>
  );
}
