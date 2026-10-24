"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Deposit, PaymentMethod } from "@/entities/wallet/types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SuccessMoment } from "@/components/shared/success-moment";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { formatMoney } from "@/lib/formatting/money";
import { useAuth } from "@/features/auth/auth-provider";
import { useHaptics, useHideKeyboard, useTelegramClosingConfirmation, useTelegramDialogs } from "@/lib/telegram/hooks";
import { useCreateDeposit } from "../queries";

/** Sham Cash: operation number only. A matching incoming transfer is credited immediately. */
export function ShamCashDepositForm({ method }: { method: PaymentMethod }) {
  const t = useTranslations();
  const { user } = useAuth();
  const claimCode = user ? `ATHAR${user.telegram_id}` : "";
  const errorMessage = useErrorMessage();
  const haptics = useHaptics();
  const dialogs = useTelegramDialogs();
  const hideKeyboard = useHideKeyboard();
  const createDeposit = useCreateDeposit();
  const [idempotencyKey] = useState(createIdempotencyKey);
  const [credited, setCredited] = useState<Deposit | null>(null);

  const schema = z.object({
    transaction_id: z
      .string()
      .trim()
      .regex(/^#?[0-9A-Za-z_-]{3,64}$/, t("deposit.shamCash.invalidNumber")),
  });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { transaction_id: "" } });
  useTelegramClosingConfirmation(credited === null);

  if (credited) {
    return (
      <div className="flex flex-col gap-5">
        <SuccessMoment
          title={t("deposit.shamCash.creditedTitle", { amount: formatMoney(credited.amount_minor, credited.currency) })}
          body={t("deposit.shamCash.creditedBody")}
        />
        <Link
          href="/wallet"
          replace
          className="flex h-12 items-center justify-center rounded-md bg-primary text-button text-primary-foreground transition-transform duration-150 active:scale-[0.97]"
        >
          {t("wallet.title")}
        </Link>
      </div>
    );
  }

  const submit = form.handleSubmit(async (values) => {
    hideKeyboard();
    const confirmed = await dialogs.confirm(t("deposit.shamCash.confirm"));
    if (!confirmed) return;
    createDeposit.mutate(
      {
        payment_method: method.code,
        details: { transaction_id: values.transaction_id.replace(/^#/, "") },
        idempotencyKey,
      },
      {
        onSuccess: (deposit) => {
          haptics.notify("success");
          setCredited(deposit);
        },
        onError: () => haptics.notify("error"),
      },
    );
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <p className="text-small text-muted-foreground">{t("deposit.shamCash.help", { code: claimCode })}</p>
      {claimCode && <p dir="ltr" className="font-display text-lg tabular-nums">{claimCode}</p>}
      <Field label={t("deposit.shamCash.number")} required error={form.formState.errors.transaction_id?.message}>
        {(a11y) => (
          <Input
            {...a11y}
            {...form.register("transaction_id")}
            inputMode="text"
            dir="ltr"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="123456789"
            className="font-display text-lg! tabular-nums"
          />
        )}
      </Field>
      {createDeposit.error && (
        <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-small text-danger">
          {errorMessage(createDeposit.error)}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={createDeposit.isPending} haptic="light">
        {t("deposit.shamCash.submit")}
      </Button>
    </form>
  );
}
