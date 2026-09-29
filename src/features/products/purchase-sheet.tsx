"use client";

import { formatMoney } from "@/lib/formatting/money";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductDetail } from "@/entities/product/types";
import type { OrderDetail } from "@/entities/order/types";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Money } from "@/components/shared/money";
import { SuccessMoment } from "@/components/shared/success-moment";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { isApiError } from "@/lib/api/errors";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { track } from "@/lib/analytics/events";
import { useHaptics, useTelegramClosingConfirmation } from "@/lib/telegram/hooks";
import { useWallet } from "@/features/wallet/queries";
import { buildOrderFormSchema, type OrderFormValues } from "./order-form-schema";
import { DynamicField } from "./dynamic-field";
import { useCreateOrder } from "./queries";

interface PurchaseSheetProps {
  product: ProductDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseSheet({ product, open, onOpenChange }: PurchaseSheetProps) {
  const t = useTranslations();
  const errorMessage = useErrorMessage();
  const haptics = useHaptics();
  const wallet = useWallet();
  const createOrder = useCreateOrder();
  const [placedOrder, setPlacedOrder] = useState<OrderDetail | null>(null);
  // One key per purchase intent: double taps and retries can never charge twice.
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const schema = useMemo(
    () => buildOrderFormSchema(product.input_fields, (key) => t(`validation.${key}`)),
    [product.input_fields, t],
  );
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inputs: Object.fromEntries(product.input_fields.map((f) => [f.key, ""])), customer_note: "" },
  });

  const price = product.price;
  const balance = wallet.data?.balance_minor;
  const shortfall = balance !== undefined ? price.final_minor - balance : 0;
  const isDirty = open && !placedOrder && (form.formState.isDirty || createOrder.isPending);

  useTelegramClosingConfirmation(isDirty);

  const submit = form.handleSubmit((values) => {
    track("order_started", { product_id: product.id });
    createOrder.mutate(
      {
        input: { product_id: product.id, inputs: values.inputs, customer_note: values.customer_note || undefined },
        idempotencyKey,
      },
      {
        onSuccess: (order) => {
          haptics.notify("success");
          track("order_created", { product_id: product.id });
          setIdempotencyKey(createIdempotencyKey());
          setPlacedOrder(order);
        },
        onError: (error) => {
          haptics.notify("error");
          if (isApiError(error)) {
            for (const [path, messages] of Object.entries(error.fields)) {
              if (path.startsWith("inputs.")) form.setError(path as `inputs.${string}`, { message: messages[0] });
            }
          }
        },
      },
    );
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setPlacedOrder(null);
      createOrder.reset();
      form.reset();
    }
  };

  const insufficient = shortfall > 0 || (isApiError(createOrder.error) && createOrder.error.code === "insufficient_balance");

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange} title={placedOrder ? t("product.orderCreatedTitle") : t("product.confirmTitle")}>
      {placedOrder ? (
        <SuccessMoment
          title={t("product.orderCreatedTitle")}
          body={t("product.orderCreatedBody", { number: placedOrder.number })}
          actions={
            <Link href={`/orders/${placedOrder.id}`} className="flex h-12 items-center justify-center rounded-md bg-primary text-button text-primary-foreground">
              {t("product.viewOrder")}
            </Link>
          }
        />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4 pb-2">
          {product.input_fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              registration={form.register(`inputs.${field.key}`)}
              error={form.formState.errors.inputs?.[field.key]?.message}
            />
          ))}

          <Field label={t("product.note")} helpText={t("common.optional")} error={form.formState.errors.customer_note?.message}>
            {(a11y) => <Textarea {...a11y} rows={2} {...form.register("customer_note")} />}
          </Field>

          <dl className="flex flex-col gap-2 rounded-md bg-surface-sunken px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-small text-muted-foreground">{t("product.yourBalance")}</dt>
              <dd className="text-small">
                {balance !== undefined ? <Money amountMinor={balance} currency={wallet.data?.currency ?? price.currency} /> : "…"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
              <dt className="text-small font-medium">{t("orders.total")}</dt>
              <dd>
                <Money amountMinor={price.final_minor} currency={price.currency} className="text-lg" />
              </dd>
            </div>
          </dl>

          {insufficient ? (
            <div className="flex flex-col gap-3 rounded-md border border-warning/30 bg-warning-soft p-4">
              <p className="text-card-title text-warning">{t("product.insufficientTitle")}</p>
              {shortfall > 0 && (
                <p className="text-small">
                  {t("product.insufficientBody", { amount: formatMoney(shortfall, price.currency) })}
                </p>
              )}
              <Link href="/wallet/deposit" className="flex h-11 items-center justify-center rounded-md bg-accent text-button text-accent-foreground">
                {t("product.topUp")}
              </Link>
            </div>
          ) : (
            <>
              {createOrder.error && <p role="alert" className="text-small text-danger">{errorMessage(createOrder.error)}</p>}
              <Button type="submit" size="lg" fullWidth loading={createOrder.isPending} haptic="medium">
                {t("product.placeOrder")}
              </Button>
              <p className="text-center text-caption text-muted-foreground">
                {t("product.confirmBody", { price: formatMoney(price.final_minor, price.currency) })}
              </p>
            </>
          )}
        </form>
      )}
    </BottomSheet>
  );
}
