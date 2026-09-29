"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gift } from "@phosphor-icons/react";
import type { GiftCodeRedemption } from "@/entities/wallet/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SuccessMoment } from "@/components/shared/success-moment";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { formatMoney } from "@/lib/formatting/money";
import { track } from "@/lib/analytics/events";
import { useHaptics, useTelegramClosingConfirmation } from "@/lib/telegram/hooks";
import { useRedeemGiftCode } from "@/features/wallet/queries";

const MIN_CODE_LENGTH = 4;

export function GiftCodeScreen() {
  const t = useTranslations();
  const errorMessage = useErrorMessage();
  const haptics = useHaptics();
  const redeem = useRedeemGiftCode();
  const [redemption, setRedemption] = useState<GiftCodeRedemption | null>(null);

  const schema = z.object({ code: z.string().trim().min(MIN_CODE_LENGTH, t("validation.tooShort")).max(64, t("validation.tooLong")) });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { code: "" } });
  useTelegramClosingConfirmation(!redemption && (form.formState.isDirty || redeem.isPending));

  const submit = form.handleSubmit(({ code }) =>
    redeem.mutate(code, {
      onSuccess: (result) => {
        haptics.notify("success");
        track("gift_code_redeemed");
        setRedemption(result);
      },
      onError: (error) => {
        haptics.notify("error");
        form.setError("code", { message: errorMessage(error) });
      },
    }),
  );

  return (
    <PageContainer withNav={false}>
      <PageHeader title={t("giftCode.title")} />
      {redemption ? (
        <SuccessMoment
          title={t("giftCode.successTitle", { amount: formatMoney(redemption.amount_minor, redemption.currency) })}
          body={t("giftCode.successBody")}
          actions={
            <Link href="/wallet" className="flex h-12 items-center justify-center rounded-md bg-primary text-button text-primary-foreground">
              {t("wallet.title")}
            </Link>
          }
        />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-lg bg-gold-soft p-4 text-gold">
            <Gift className="size-7 shrink-0" weight="duotone" />
            <p className="text-small text-foreground">{t("giftCode.subtitle")}</p>
          </div>
          <Field label={t("giftCode.label")} required error={form.formState.errors.code?.message}>
            {(a11y) => (
              <Input
                {...a11y}
                {...form.register("code")}
                dir="ltr"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder={t("giftCode.placeholder")}
                className="font-display tracking-[0.12em] uppercase"
              />
            )}
          </Field>
          <Button type="submit" size="lg" fullWidth loading={redeem.isPending} haptic="light">
            {t("giftCode.redeem")}
          </Button>
        </form>
      )}
    </PageContainer>
  );
}
