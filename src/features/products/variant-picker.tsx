"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ProductVariant } from "@/entities/product/types";
import { Money } from "@/components/shared/money";
import { formatPeriod } from "@/lib/formatting/period";
import { ProductImage } from "./product-image";
import { cn } from "@/lib/cn";

export function VariantPicker({
  variants,
  value,
  onChange,
}: {
  variants: ProductVariant[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  if (variants.length === 0) return null;

  const showImages = variants.some((variant) => variant.image_url);

  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="text-section-title">{t("tiers")}</legend>
      <div className="flex flex-col gap-2.5">
        {variants.map((variant) => {
          const selected = variant.id === value;
          return (
            <button
              key={variant.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(variant.id)}
              className={cn(
                "flex w-full min-w-0 items-start gap-3 rounded-lg border p-2.5 text-start transition-colors",
                selected ? "border-accent bg-accent-soft" : "border-border bg-surface active:bg-muted/40",
              )}
            >
              {showImages && (
                <ProductImage
                  src={variant.image_url}
                  alt=""
                  sizes="96px"
                  className="size-24 shrink-0 rounded-md"
                  frame={variant}
                />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
                <span dir="auto" className="text-card-title text-foreground">{variant.name}</span>
                {variant.subscription_period && (
                  <span className="text-caption text-muted-foreground">
                    {formatPeriod(variant.subscription_period.count, variant.subscription_period.unit, locale)}
                  </span>
                )}
                <Money amountMinor={variant.price.final_minor} currency={variant.price.currency} className="text-base" />
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
