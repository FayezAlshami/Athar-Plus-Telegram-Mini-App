"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Package, XCircle } from "@phosphor-icons/react";
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
import { ProductImage } from "@/features/products/product-image";
import { cn } from "@/lib/cn";
import { OrderStatusBadge } from "./order-status-badge";
import { useCancelOrder, useOrder } from "./queries";

function OrderSkeleton() {
  return (
    <>
      <div className="flex min-h-11 items-center gap-3" role="status" aria-busy="true">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </>
  );
}

export function OrderScreen({ id }: { id: string }) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const { data: order, isPending, error, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (error) {
    return (
      <PageContainer>
        <PageHeader title={t("title")} />
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageContainer>
    );
  }
  if (isPending) {
    return (
      <PageContainer>
        <OrderSkeleton />
      </PageContainer>
    );
  }

  const failed = order.status === "cancelled" || order.status === "rejected";

  return (
    <PageContainer>
      <PageHeader title={t("title")} subtitle={order.number} />

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <ProductImage src={order.product.image_url} alt={order.product.name ?? ""} sizes="56px" className="size-14 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            <p dir="auto" className="line-clamp-2 text-card-title">{order.product.variant_name ? `${order.product.name ?? t("title")} · ${order.product.variant_name}` : (order.product.name ?? t("title"))}</p>
            <p className="text-caption text-muted-foreground">{formatDateTime(order.created_at, locale)}</p>
          </div>
          <span className="shrink-0 self-start">
            <OrderStatusBadge status={order.status} />
          </span>
        </div>

        <dl className="flex flex-col gap-2.5 rounded-md bg-surface-sunken p-3.5 text-small">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{t("number")}</dt>
            <dd className="flex min-w-0 items-center gap-0.5">
              <bdi dir="ltr" className="truncate font-display font-semibold tabular-nums">{order.number}</bdi>
              <CopyButton value={order.number} className="-me-2 size-8" />
            </dd>
          </div>
          {order.discount_minor > 0 && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t("discount")}</dt>
              <dd dir="ltr" className="text-success">
                −<Money amountMinor={order.discount_minor} currency={order.currency} />
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
            <dt className="font-medium">{t("total")}</dt>
            <dd>
              <Money amountMinor={order.total_minor} currency={order.currency} className={cn("text-xl", failed && "text-muted-foreground line-through")} />
            </dd>
          </div>
        </dl>
      </section>

      {order.delivery && (
        <Section title={t("delivery")}>
          <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success-soft p-4">
            <Package className="mt-0.5 size-5 shrink-0 text-success" weight="duotone" />
            <code dir="ltr" className="min-w-0 flex-1 select-all whitespace-pre-wrap break-all font-mono text-small text-foreground">{order.delivery}</code>
            <CopyButton value={order.delivery} className="-my-1.5 -me-1.5" />
          </div>
        </Section>
      )}

      {order.inputs.length > 0 && (
        <Section title={t("submittedInfo")}>
          <ListGroup>
            {order.inputs.map((input) => (
              <ListItem
                key={input.key}
                title={<span dir="auto">{input.value}</span>}
                subtitle={input.label}
                trailing={<CopyButton value={input.value} className="-me-2" />}
              />
            ))}
          </ListGroup>
        </Section>
      )}

      <Section title={t("timeline")}>
        <ol className="flex flex-col rounded-lg border border-border bg-surface p-4 shadow-sm">
          {order.timeline.map((step, index) => {
            const last = index === order.timeline.length - 1;
            const stepFailed = step.status === "cancelled" || step.status === "rejected";
            // Earlier steps are done; the last one is where the order stands now.
            const inProgress = last && !stepFailed && step.status !== "completed";
            return (
              <li key={`${step.status}-${step.at}`} aria-current={last ? "step" : undefined} className="relative flex gap-3 pb-4 last:pb-0">
                {!last && <span aria-hidden className="absolute start-[9px] top-6 bottom-0 w-0.5 rounded-full bg-accent/30" />}
                {inProgress ? (
                  <span aria-hidden className="relative flex size-5 shrink-0 items-center justify-center">
                    <span className="absolute size-5 animate-ping rounded-full bg-accent/25" />
                    <span className="size-2.5 rounded-full bg-accent ring-4 ring-accent-soft" />
                  </span>
                ) : last && stepFailed ? (
                  <XCircle aria-hidden className="relative size-5 shrink-0 text-danger" weight="fill" />
                ) : (
                  <CheckCircle aria-hidden className={cn("relative size-5 shrink-0", last ? "text-success" : "text-accent/70")} weight="fill" />
                )}
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className={cn("text-small", last ? "font-semibold text-foreground" : "text-muted-foreground")}>{t(`status.${step.status}`)}</span>
                  <span className="text-caption text-muted-foreground">{formatDateTime(step.at, locale)}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      {order.is_cancellable && (
        <Button variant="danger" size="lg" fullWidth onClick={() => setConfirmOpen(true)}>
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
          <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(false)} disabled={cancelOrder.isPending}>
            {tCommon("cancel")}
          </Button>
        </div>
      </BottomSheet>
    </PageContainer>
  );
}
