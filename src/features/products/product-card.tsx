"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Crown } from "@phosphor-icons/react";
import type { Product } from "@/entities/product/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/shared/money";
import { fadeUp } from "@/lib/animation/variants";
import { usePrefetchProduct } from "@/features/catalog/use-prefetch-catalog";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import { ProductImage } from "./product-image";

/** Rail card: image, title, subtitle, price (start) + buy chip (end). */
export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();
  const memberPrice = product.price.membership_discount_minor > 0;
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchProduct(product.id, product.image_url);

  return (
    <motion.div variants={fadeUp} className="relative w-[168px] shrink-0 self-start" ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
      <Card href={`/products/${product.id}`} className="flex min-h-[248px] flex-col overflow-hidden">
        <div className="relative">
          <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute start-2 top-2 z-20" />
          <ProductImage src={product.image_url} alt={product.name} sizes="168px" className="aspect-[4/3] rounded-none" />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p dir="auto" className="line-clamp-2 min-h-[2.9em] text-card-title">
            {product.name}
          </p>
          {product.summary ? (
            <p dir="auto" className="truncate text-caption text-muted-foreground">
              {product.summary}
            </p>
          ) : null}
          {!product.is_purchasable ? (
            <Badge tone="warning" className="mt-1 self-start">
              {t("product.unavailable")}
            </Badge>
          ) : memberPrice ? (
            <Badge tone="gold" icon={<Crown weight="fill" />} className="mt-1 self-start">
              {t("product.membershipPrice")}
            </Badge>
          ) : null}
          <div dir="ltr" className="mt-auto flex flex-row items-center justify-between gap-2 pt-2">
            <Money amountMinor={product.price.final_minor} currency={product.price.currency} className="text-base leading-none" />
            <span className="shrink-0 rounded-md bg-accent-soft px-2.5 py-1.5 text-caption font-semibold text-accent">
              {t("product.buyShort")}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
