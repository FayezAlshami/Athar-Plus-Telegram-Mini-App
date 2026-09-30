"use client";

import { motion } from "motion/react";
import type { Product } from "@/entities/product/types";
import { Skeleton } from "@/components/ui/skeleton";
import { listContainer } from "@/lib/animation/variants";
import { ProductCard } from "./product-card";

/** Horizontally scrolling rail with native momentum and scroll snapping. */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="scrollbar-none -mx-4 flex items-start snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2 [&>*]:snap-start"
    >
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </motion.div>
  );
}

export function ProductRailSkeleton() {
  return (
    <div className="-mx-4 flex gap-3 overflow-hidden px-4 pb-2" role="status" aria-busy="true">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex w-[168px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-1 flex-col gap-2 p-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="mt-auto flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-7 w-12 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
