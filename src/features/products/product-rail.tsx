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
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:snap-start"
    >
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </motion.div>
  );
}

export function ProductRailSkeleton() {
  return (
    <div className="-mx-4 flex gap-3 overflow-hidden px-4">
      {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[236px] w-[168px] shrink-0 rounded-lg" />)}
    </div>
  );
}
