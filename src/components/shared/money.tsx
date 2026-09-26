"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ProductPrice } from "@/entities/product/types";
import { formatLocalAmount, formatMoney } from "@/lib/formatting/money";
import { cn } from "@/lib/cn";

export function Money({ amountMinor, currency, className }: { amountMinor: number; currency: string; className?: string }) {
  return (
    <bdi className={cn("text-price", className)} dir="ltr">
      {formatMoney(amountMinor, currency)}
    </bdi>
  );
}

interface PriceProps {
  price: ProductPrice;
  size?: "sm" | "lg";
  showLocal?: boolean;
}

/** Displays a server-resolved price. Never computes discounts itself. */
export function Price({ price, size = "sm", showLocal = false }: PriceProps) {
  const locale = useLocale();
  const t = useTranslations("wallet");
  const hasDiscount = price.discount_minor > 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-2">
        <Money
          amountMinor={price.final_minor}
          currency={price.currency}
          className={cn(size === "lg" ? "text-2xl" : "text-base", price.membership_discount_minor > 0 ? "text-gold" : "text-foreground")}
        />
        {hasDiscount && (
          <Money amountMinor={price.base_minor} currency={price.currency} className="text-small font-normal text-muted-foreground line-through" />
        )}
      </div>
      {showLocal && price.local && (
        <span className="text-caption text-muted-foreground">
          {t("localEquivalent", { amount: formatLocalAmount(price.local.amount, price.local.currency, locale) })}
        </span>
      )}
    </div>
  );
}
