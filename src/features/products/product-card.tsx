"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Crown } from "@phosphor-icons/react";
import type { Product } from "@/entities/product/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/money";
import { fadeUp } from "@/lib/animation/variants";
import { usePrefetchProduct } from "@/features/catalog/use-prefetch-catalog";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import { ProductImage } from "./product-image";

/** Rail card: identity, name, final price, and at most one status/benefit label. */
export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();
  const memberPrice = product.price.membership_discount_minor > 0;
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchProduct(product.id, product.image_url);

  return (
    <motion.div variants={fadeUp} className="relative w-[168px] shrink-0 self-start" ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
      <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute start-2 top-2 z-20" />
      <Card href={`/products/${product.id}`} className="flex flex-col overflow-hidden">
        <ProductImage src={product.image_url} alt={product.name} sizes="168px" className="aspect-[4/3]" />
        <div className="flex flex-col gap-2 p-3">
          <p dir="auto" className="line-clamp-2 min-h-[3.1em] text-card-title">{product.name}</p>
          <div className="flex flex-col gap-1.5">
            <Price price={product.price} />
            {!product.is_purchasable ? (
              <Badge tone="warning" className="self-start">{t("product.unavailable")}</Badge>
            ) : memberPrice ? (
              <Badge tone="gold" icon={<Crown weight="fill" />} className="self-start">{t("product.membershipPrice")}</Badge>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
