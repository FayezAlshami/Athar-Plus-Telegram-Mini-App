"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PaymentMethod } from "@/entities/wallet/types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { SuccessMoment } from "@/components/shared/success-moment";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { formatMoney, parseMajorToMinor } from "@/lib/formatting/money";
import { useHaptics } from "@/lib/telegram/hooks";
import { useCreateDeposit } from "../queries";

/**
 * Amount + note request that creates a *pending* deposit for staff review.
 * PENDING SPECIFICATION: method-specific fields (references, receipts,
 * networks) are added in the method's own module once defined.
 */
export function GenericDepositForm({ method }: { method: PaymentMethod }) {
  const t = useTranslations();
  const errorMessage = useErrorMessage();
  const haptics = useHaptics();
  const createDeposit = useCreateDeposit();
  const [idempotencyKey] = useState(createIdempotencyKey);
  const [submitted, setSubmitted] = useState(false);

  const min = method.min_amount_minor ?? 1;
  const max = method.max_amount_minor;
  const rangeHelp = max
    ? t("deposit.amountRange", { min: formatMoney(min, "USD"), max: formatMoney(max, "USD") })
    : method.min_amount_minor
      ? t("deposit.amountMin", { min: formatMoney(min, "USD") })
      : t("deposit.amountHelp");

  const schema = z.object({
    amount: z.string().refine((value) => {
      const minor = parseMajorToMinor(value);
      return minor !== null && minor >= min && (max === null || minor <= max);
    }, t("deposit.invalidAmount")),
    customer_note: z.string().max(500, t("validation.tooLong")),
  });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { amount: "", customer_note: "" } });

  if (submitted) {
    return <SuccessMoment title={t("deposit.submittedTitle")} body={t("deposit.submittedBody")} />;
  }

  const submit = form.handleSubmit((values) =>
    createDeposit.mutate(
      {
        payment_method: method.code,
        amount_minor: parseMajorToMinor(values.amount) ?? 0,
        details: { customer_note: values.customer_note || null },
        idempotencyKey,
      },
      {
        onSuccess: () => {
          haptics.notify("success");
          setSubmitted(true);
        },
        onError: () => haptics.notify("error"),
      },
    ),
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label={t("deposit.amount")} required helpText={rangeHelp} error={form.formState.errors.amount?.message}>
        {(a11y) => <Input {...a11y} {...form.register("amount")} inputMode="decimal" dir="ltr" autoComplete="off" placeholder="10" className="font-display text-lg tabular-nums" />}
      </Field>
      <Field label={t("deposit.note")} helpText={t("common.optional")} error={form.formState.errors.customer_note?.message}>
        {(a11y) => <Textarea {...a11y} {...form.register("customer_note")} rows={2} />}
      </Field>
      {createDeposit.error && <p role="alert" className="text-small text-danger">{errorMessage(createDeposit.error)}</p>}
      <Button type="submit" size="lg" fullWidth loading={createDeposit.isPending}>
        {t("deposit.submit")}
      </Button>
    </form>
  );
}
