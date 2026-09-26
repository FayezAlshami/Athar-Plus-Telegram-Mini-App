"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Crown } from "@phosphor-icons/react";
import type { Product } from "@/entities/product/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/money";
import { fadeUp } from "@/lib/animation/variants";
import { ProductImage } from "./product-image";

/** Rail card: identity, name, final price, and at most one status/benefit label. */
export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();
  const memberPrice = product.price.membership_discount_minor > 0;

  return (
    <motion.div variants={fadeUp} className="w-[168px] shrink-0">
      <Card href={`/products/${product.id}`} className="flex h-full flex-col overflow-hidden">
        <ProductImage src={product.image_url} alt={product.name} sizes="168px" className="aspect-[4/3]" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <p dir="auto" className="line-clamp-2 text-card-title">{product.name}</p>
          <div className="mt-auto flex flex-col gap-1.5">
            <Price price={product.price} />
            {!product.is_purchasable ? (
              <Badge tone="warning">{t("product.unavailable")}</Badge>
            ) : memberPrice ? (
              <Badge tone="gold" icon={<Crown weight="fill" />}>{t("product.membershipPrice")}</Badge>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
