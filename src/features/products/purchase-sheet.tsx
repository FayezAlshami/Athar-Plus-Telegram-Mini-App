"use client";

import { formatMoney } from "@/lib/formatting/money";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductDetail } from "@/entities/product/types";
import type { OrderDetail } from "@/entities/order/types";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Money, Price } from "@/components/shared/money";
import { SuccessMoment } from "@/components/shared/success-moment";
import { duration, easing } from "@/lib/animation/tokens";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { isApiError } from "@/lib/api/errors";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { track } from "@/lib/analytics/events";
import { useHaptics, useTelegramClosingConfirmation, useTelegramDialogs } from "@/lib/telegram/hooks";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { maybeNudgeHomeScreen } from "@/features/profile/home-screen-nudge";
import { useWallet } from "@/features/wallet/queries";
import { buildOrderFormSchema, type OrderFormValues } from "./order-form-schema";
import { DynamicField } from "./dynamic-field";
import { ProductImage } from "./product-image";
import { useCreateOrder } from "./queries";

type Step = "summary" | "details" | "confirm";

const STEP_LABEL = { summary: "stepProduct", details: "stepDetails", confirm: "stepConfirm" } as const;

/** Segmented progress: done and current steps fill in, the current label is emphasized. */
function Stepper({ steps, current }: { steps: Step[]; current: Step }) {
  const t = useTranslations("product");
  const currentIndex = steps.indexOf(current);
  return (
    <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => (
        <li key={step} aria-current={index === currentIndex ? "step" : undefined} className="flex min-w-0 flex-col gap-1.5">
          <span className="h-1 overflow-hidden rounded-full bg-muted">
            <motion.span
              className="block h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: index <= currentIndex ? "100%" : "0%" }}
              transition={{ duration: duration.normal, ease: easing.standard }}
            />
          </span>
          <span className={index === currentIndex ? "truncate text-caption font-semibold text-foreground" : "truncate text-caption text-muted-foreground"}>
            {index + 1}. {t(STEP_LABEL[step])}
          </span>
        </li>
      ))}
    </ol>
  );
}

interface PurchaseSheetProps {
  product: ProductDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseSheet({ product, open, onOpenChange }: PurchaseSheetProps) {
  const t = useTranslations();
  const errorMessage = useErrorMessage();
  const haptics = useHaptics();
  const dialogs = useTelegramDialogs();
  const telegram = useTelegramState();
  const router = useRouter();
  const wallet = useWallet();
  const createOrder = useCreateOrder();
  const [placedOrder, setPlacedOrder] = useState<OrderDetail | null>(null);
  const [step, setStep] = useState<Step>("summary");
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
  const isDirty = open && !placedOrder;

  useTelegramClosingConfirmation(isDirty);

  const needsDetails = product.input_fields.length > 0;
  const steps: Step[] = needsDetails ? ["summary", "details", "confirm"] : ["summary", "confirm"];

  const submit = form.handleSubmit(async (values) => {
    const confirmed = await dialogs.confirm(
      t("product.confirmCharge", { price: formatMoney(price.final_minor, price.currency) }),
    );
    if (!confirmed) return;
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
          if (telegram.status === "ready") {
            void maybeNudgeHomeScreen(telegram.adapter, {
              title: t("profile.addToHomePrompt"),
              action: t("profile.addToHome"),
              dismiss: t("common.close"),
            });
          }
        },
        onError: (error) => {
          haptics.notify("error");
          if (isApiError(error)) {
            let fieldError = false;
            for (const [path, messages] of Object.entries(error.fields)) {
              if (!path.startsWith("inputs.")) continue;
              form.setError(path as `inputs.${string}`, { message: messages[0] });
              fieldError = true;
            }
            // Send the customer back to the field the server rejected instead of a dead end.
            if (fieldError && needsDetails) setStep("details");
          }
        },
      },
    );
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setPlacedOrder(null);
      setStep("summary");
      createOrder.reset();
      form.reset();
    }
  };

  const goToConfirm = () => {
    void form.trigger().then((valid) => {
      if (valid) setStep("confirm");
    });
  };

  /** Closes the sheet first so the next screen never opens under a lingering overlay. */
  const leaveTo = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const insufficient = shortfall > 0 || (isApiError(createOrder.error) && createOrder.error.code === "insufficient_balance");

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange} title={placedOrder ? t("product.orderCreatedTitle") : t("product.confirmTitle")}>
      {placedOrder ? (
        <SuccessMoment
          title={t("product.orderCreatedTitle")}
          body={t("product.orderCreatedBody", { number: placedOrder.number })}
          actions={
            <>
              <Button size="lg" fullWidth onClick={() => leaveTo(`/orders/${placedOrder.id}`)}>
                {t("product.viewOrder")}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => handleOpenChange(false)}>
                {t("common.done")}
              </Button>
            </>
          }
        />
      ) : (
        <form
          noValidate
          className="flex flex-col gap-4 pb-2"
          onSubmit={(event) => {
            // The keyboard's Enter/Go advances a step; only the confirm step can place the order.
            if (step === "confirm") return void submit(event);
            event.preventDefault();
            if (step === "summary") setStep(needsDetails ? "details" : "confirm");
            else goToConfirm();
          }}
        >
          <Stepper steps={steps} current={step} />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: duration.fast, ease: easing.standard }}
              className="flex flex-col gap-4"
            >
              {step === "summary" && (
                <>
                  <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
                    <ProductImage src={product.image_url} alt={product.name} sizes="64px" className="size-16 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p dir="auto" className="line-clamp-2 text-card-title">{product.name}</p>
                      <div className="mt-1">
                        <Price price={price} showLocal />
                      </div>
                    </div>
                  </div>
                  <Button type="button" size="lg" fullWidth onClick={() => setStep(needsDetails ? "details" : "confirm")}>
                    {t("product.continueToDetails")}
                  </Button>
                </>
              )}

              {step === "details" && (
                <>
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
                  <div className="flex flex-col gap-2">
                    <Button type="button" size="lg" fullWidth onClick={goToConfirm}>
                      {t("common.continue")}
                    </Button>
                    <Button type="button" variant="ghost" fullWidth onClick={() => setStep("summary")}>
                      {t("nav.back")}
                    </Button>
                  </div>
                </>
              )}

              {step === "confirm" && (
                <>
                  <dl className="flex flex-col gap-2 rounded-md bg-surface-sunken px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-small text-muted-foreground">{t("product.yourBalance")}</dt>
                      <dd className="text-small">
                        {balance !== undefined ? (
                          <Money amountMinor={balance} currency={wallet.data?.currency ?? price.currency} />
                        ) : (
                          <Skeleton className="h-4 w-16" />
                        )}
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
                    <div role="alert" className="flex flex-col gap-3 rounded-md border border-warning/30 bg-warning-soft p-4">
                      <p className="text-card-title text-warning">{t("product.insufficientTitle")}</p>
                      {shortfall > 0 && (
                        <p className="text-small">
                          {t("product.insufficientBody", { amount: formatMoney(shortfall, price.currency) })}
                        </p>
                      )}
                      <Button variant="accent" fullWidth onClick={() => leaveTo("/wallet/deposit")}>
                        {t("product.topUp")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      {createOrder.error && (
                        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-small text-danger">
                          {errorMessage(createOrder.error)}
                        </p>
                      )}
                      <Button type="submit" size="lg" fullWidth loading={createOrder.isPending} haptic="medium">
                        {t("product.placeOrder")}
                      </Button>
                      <p className="text-center text-caption text-muted-foreground">
                        {t("product.confirmBody", { price: formatMoney(price.final_minor, price.currency) })}
                      </p>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    disabled={createOrder.isPending}
                    onClick={() => setStep(needsDetails ? "details" : "summary")}
                  >
                    {needsDetails ? t("product.backToDetails") : t("nav.back")}
                  </Button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      )}
    </BottomSheet>
  );
}
