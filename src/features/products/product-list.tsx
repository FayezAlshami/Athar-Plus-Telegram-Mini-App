"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Crown } from "@phosphor-icons/react";
import type { Product } from "@/entities/product/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/shared/money";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { usePrefetchProduct } from "@/features/catalog/use-prefetch-catalog";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import { cn } from "@/lib/cn";
import { ProductImage } from "./product-image";

export function ProductRow({ product, showFavorite = false }: { product: Product; showFavorite?: boolean }) {
  const t = useTranslations("product");
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchProduct<HTMLLIElement>(product.id, product.image_url);
  const memberPrice = product.price.membership_discount_minor > 0;

  return (
    <motion.li variants={fadeUp} className="relative" ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
      <Card href={`/products/${product.id}`} className={cn("flex h-full items-center gap-3 p-2.5", showFavorite && "pe-12")}>
        <ProductImage src={product.image_url} alt={product.name} sizes="72px" className="size-[72px] shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p dir="auto" className="line-clamp-2 text-card-title">{product.name}</p>
          {product.summary && <p dir="auto" className="truncate text-small text-muted-foreground">{product.summary}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Price price={product.price} />
            {!product.is_purchasable ? (
              <Badge tone="warning">{t("unavailable")}</Badge>
            ) : memberPrice ? (
              <Badge tone="gold" icon={<Crown weight="fill" />}>{t("membershipPrice")}</Badge>
            ) : null}
          </div>
        </div>
      </Card>
      {/* A sibling of the link, not a child: interactive content can't nest inside <a>. */}
      {showFavorite && <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute end-2.5 top-2.5 z-10 size-8" />}
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
    <div className="grid gap-2.5 md:grid-cols-2" role="status" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5">
          <Skeleton className="size-[72px] shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
