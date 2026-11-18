"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Money } from "@/components/shared/money";
import { LoadMore } from "@/components/shared/load-more";
import { ErrorState } from "@/components/shared/error-state";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { formatMoney, minorToMajorInput, parseMajorToMinor } from "@/lib/formatting/money";
import { useHideKeyboard, useTelegramDialogs } from "@/lib/telegram/hooks";
import { useCancelWithdrawal, useCreateWithdrawal, useWallet, useWithdrawals } from "./queries";

export function WithdrawalScreen() {
  const t = useTranslations();
  const errorMessage = useErrorMessage();
  const dialogs = useTelegramDialogs();
  const hideKeyboard = useHideKeyboard();
  const wallet = useWallet();
  const withdrawals = useWithdrawals();
  const create = useCreateWithdrawal();
  const cancel = useCancelWithdrawal();
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const balance = wallet.data?.balance_minor ?? 0;
  const currency = wallet.data?.currency ?? "USD";

  const schema = z.object({
    amount: z.string().trim().min(1, t("withdrawal.invalidAmount")),
    reason: z.string().trim().min(3, t("validation.tooShort")).max(500, t("validation.tooLong")),
    destination: z.string().trim().min(3, t("validation.tooShort")).max(160, t("validation.tooLong")),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", reason: "", destination: "" },
  });

  useEffect(() => {
    if (wallet.data && !form.formState.isDirty) form.setValue("amount", minorToMajorInput(wallet.data.balance_minor));
  }, [wallet.data, form]);

  const items = withdrawals.data?.pages.flatMap((page) => page.data) ?? [];

  const submit = form.handleSubmit(async (values) => {
    hideKeyboard();
    const amountMinor = parseMajorToMinor(values.amount, currency);
    if (amountMinor === null) {
      form.setError("amount", { message: t("withdrawal.invalidAmount") });
      return;
    }
    if (amountMinor > balance) {
      form.setError("amount", { message: t("withdrawal.insufficient") });
      return;
    }
    const confirmed = await dialogs.confirm(t("withdrawal.confirm", { amount: formatMoney(amountMinor, currency) }));
    if (!confirmed) return;
    try {
      await create.mutateAsync({
        amount_minor: amountMinor,
        reason: values.reason.trim(),
        destination: values.destination.trim(),
        idempotencyKey,
      });
      setIdempotencyKey(createIdempotencyKey());
      form.reset({ amount: "", reason: "", destination: "" });
    } catch (error) {
      form.setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
      <PageHeader title={t("withdrawal.title")} />
      <p className="text-body text-muted-foreground">{t("withdrawal.body")}</p>
      <p className="text-card-title">
        {t("withdrawal.available")} <Money amountMinor={balance} currency={currency} />
      </p>
      {balance < 1 ? (
        <p className="rounded-lg border border-border bg-surface p-4 text-body">{t("withdrawal.empty")}</p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <Field label={t("withdrawal.amount")} error={form.formState.errors.amount?.message}>
            {(a11y) => <Input {...a11y} {...form.register("amount")} dir="ltr" inputMode="decimal" />}
          </Field>
          <Field label={t("withdrawal.reason")} error={form.formState.errors.reason?.message}>
            {(a11y) => <Textarea {...a11y} {...form.register("reason")} />}
          </Field>
          <Field label={t("withdrawal.destination")} helpText={t("withdrawal.destinationHelp")} error={form.formState.errors.destination?.message}>
            {(a11y) => <Input {...a11y} {...form.register("destination")} />}
          </Field>
          {form.formState.errors.root?.message && <p className="text-caption text-danger">{form.formState.errors.root.message}</p>}
          <Button type="submit" size="lg" fullWidth loading={create.isPending}>{t("withdrawal.submit")}</Button>
        </form>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-section-title">{t("withdrawal.history")}</h2>
        {withdrawals.error ? <ErrorState error={withdrawals.error} onRetry={() => withdrawals.refetch()} /> : null}
        {items.length === 0 ? <p className="text-body text-muted-foreground">{t("withdrawal.historyEmpty")}</p> : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <Money amountMinor={item.amount_minor} currency={item.currency} className="text-card-title" />
                  <span className="text-caption">{t(`withdrawal.status.${item.status}`)}</span>
                </div>
                <p dir="auto" className="text-body">{item.reason}</p>
                <p dir="auto" className="text-caption text-muted-foreground">{item.destination}</p>
                {item.decision_note && <p dir="auto" className="text-caption">{item.decision_note}</p>}
                {item.status === "pending" && (
                  <Button variant="secondary" loading={cancel.isPending} onClick={() => cancel.mutate(item.id)}>
                    {t("withdrawal.cancel")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <LoadMore hasNext={Boolean(withdrawals.hasNextPage)} isFetching={withdrawals.isFetchingNextPage} onLoadMore={() => withdrawals.fetchNextPage()} />
      </section>
      </div>
    </PageContainer>
  );
}
