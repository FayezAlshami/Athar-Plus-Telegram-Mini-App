"use client";

import { useTranslations } from "next-intl";
import type { ProductVariant } from "@/entities/product/types";
import { Money } from "@/components/shared/money";
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
  if (variants.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-section-title">{t("tiers")}</legend>
      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant) => {
          const selected = variant.id === value;
          return (
            <button
              key={variant.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(variant.id)}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-lg border bg-surface p-2 text-start transition-colors",
                selected ? "border-accent bg-accent-soft" : "border-border active:bg-muted/40",
              )}
            >
              {variant.image_url && (
                <ProductImage src={variant.image_url} alt="" sizes="40px" className="size-10 shrink-0 rounded-md" />
              )}
              <span className="min-w-0 flex-1">
                <span dir="auto" className="block truncate text-card-title">{variant.name}</span>
                <Money amountMinor={variant.price.final_minor} currency={variant.price.currency} className="text-caption" />
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
