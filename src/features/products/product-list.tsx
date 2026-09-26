"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { Product } from "@/entities/product/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/shared/money";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { ProductImage } from "./product-image";

export function ProductRow({ product }: { product: Product }) {
  const t = useTranslations("product");
  return (
    <motion.li variants={fadeUp}>
      <Card href={`/products/${product.id}`} className="flex items-center gap-3 p-2.5">
        <ProductImage src={product.image_url} alt={product.name} sizes="72px" className="size-[72px] shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p dir="auto" className="truncate text-card-title">{product.name}</p>
          {product.summary && <p dir="auto" className="truncate text-small text-muted-foreground">{product.summary}</p>}
          <div className="mt-1 flex items-center gap-2">
            <Price price={product.price} />
            {!product.is_purchasable && <Badge tone="warning">{t("unavailable")}</Badge>}
          </div>
        </div>
      </Card>
    </motion.li>
  );
}

export function ProductList({ products }: { products: Product[] }) {
  return (
    <motion.ul variants={listContainer} initial="hidden" animate="visible" className="grid gap-2.5 md:grid-cols-2">
      {products.map((product) => <ProductRow key={product.id} product={product} />)}
    </motion.ul>
  );
}

export function ProductListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-2.5">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-[92px] rounded-lg" />)}
    </div>
  );
}
