"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { Product } from "@/entities/product/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/shared/money";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { usePrefetchProduct } from "@/features/catalog/use-prefetch-catalog";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import { ProductImage } from "./product-image";

export function ProductRow({ product, showFavorite = false }: { product: Product; showFavorite?: boolean }) {
  const t = useTranslations("product");
  const prefetch = usePrefetchProduct<HTMLLIElement>(product.id, product.image_url);

  return (
    <motion.li variants={fadeUp} ref={prefetch.ref} onMouseEnter={prefetch.onMouseEnter} onTouchStart={prefetch.onTouchStart}>
      <Card href={`/products/${product.id}`} className="relative flex items-center gap-3 p-2.5">
        {showFavorite && <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute end-2 top-2 z-10 size-8" />}
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

export function ProductList({ products, showFavorite = false }: { products: Product[]; showFavorite?: boolean }) {
  return (
    <motion.ul variants={listContainer} initial="hidden" animate="visible" className="grid gap-2.5 md:grid-cols-2">
      {products.map((product) => (
        <ProductRow key={product.id} product={product} showFavorite={showFavorite} />
      ))}
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
