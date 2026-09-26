"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { Money } from "@/components/shared/money";
import { Section } from "@/components/shared/section";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { formatDateTime } from "@/lib/formatting/dates";
import { OrderStatusBadge } from "./order-status-badge";
import { useCancelOrder, useOrder } from "./queries";

export function OrderScreen({ id }: { id: string }) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const { data: order, isPending, error, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (error) return <PageContainer withNav={false}><PageHeader title={t("title")} /><ErrorState error={error} onRetry={() => refetch()} /></PageContainer>;
  if (isPending) return <PageContainer withNav={false}><Skeleton className="h-11 w-40" /><Skeleton className="h-40 rounded-lg" /><Skeleton className="h-40 rounded-lg" /></PageContainer>;

  return (
    <PageContainer withNav={false}>
      <PageHeader title={order.product.name ?? t("title")} />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-small text-muted-foreground">{t("number")}</span>
          <span className="flex items-center gap-1">
            <span className="text-card-title" dir="ltr">{order.number}</span>
            <CopyButton value={order.number} />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <OrderStatusBadge status={order.status} />
          <Money amountMinor={order.total_minor} currency={order.currency} className="text-xl" />
        </div>
        {order.discount_minor > 0 && (
          <div className="flex items-center justify-between text-small">
            <span className="text-muted-foreground">{t("discount")}</span>
            <Money amountMinor={order.discount_minor} currency={order.currency} className="text-success" />
          </div>
        )}
        <p className="text-caption text-muted-foreground">{t("createdAt")}: {formatDateTime(order.created_at, locale)}</p>
      </div>

      {order.delivery && (
        <Section title={t("delivery")}>
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft p-4">
            <code dir="ltr" className="min-w-0 flex-1 break-all text-body">{order.delivery}</code>
            <CopyButton value={order.delivery} />
          </div>
        </Section>
      )}

      {order.inputs.length > 0 && (
        <Section title={t("submittedInfo")}>
          <ListGroup>
            {order.inputs.map((input) => (
              <ListItem key={input.key} title={<span dir="auto">{input.value}</span>} subtitle={input.label} />
            ))}
          </ListGroup>
        </Section>
      )}

      <Section title={t("timeline")}>
        <ol className="flex flex-col gap-3 ps-1">
          {order.timeline.map((step, index) => {
            const last = index === order.timeline.length - 1;
            return (
              <li key={`${step.status}-${step.at}`} className="flex items-center gap-3">
                {last ? <CheckCircle className="size-5 text-accent" weight="fill" /> : <Circle className="size-5 text-muted-foreground" />}
                <span className="flex-1 text-small">{t(`status.${step.status}`)}</span>
                <span className="text-caption text-muted-foreground">{formatDateTime(step.at, locale)}</span>
              </li>
            );
          })}
        </ol>
      </Section>

      {order.is_cancellable && (
        <Button variant="danger" fullWidth onClick={() => setConfirmOpen(true)}>
          {t("cancel")}
        </Button>
      )}

      <BottomSheet open={confirmOpen} onOpenChange={setConfirmOpen} title={t("cancel")} description={t("cancelConfirm")}>
        <div className="flex flex-col gap-2 pb-2">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            haptic="medium"
            loading={cancelOrder.isPending}
            onClick={() =>
              cancelOrder.mutate(order.id, {
                onSuccess: () => {
                  setConfirmOpen(false);
                  toast.success(t("cancelled"));
                },
                onError: (cancelError) => toast.error(errorMessage(cancelError)),
              })
            }
          >
            {tCommon("confirm")}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(false)}>
            {tCommon("cancel")}
          </Button>
        </div>
      </BottomSheet>
    </PageContainer>
  );
}
