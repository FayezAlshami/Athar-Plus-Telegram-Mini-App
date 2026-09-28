"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { Category } from "@/entities/category/types";
import { Card } from "@/components/ui/card";
import { fadeUp } from "@/lib/animation/variants";
import { usePrefetchCategory } from "@/features/catalog/use-prefetch-catalog";
import { CategoryIcon } from "./category-icon";

export function CategoryCard({ category, compact = false }: { category: Category; compact?: boolean }) {
  const t = useTranslations("categories");
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchCategory(category.slug);
  const href = `/categories/${encodeURIComponent(category.slug)}`;

  if (compact) {
    return (
      <motion.div variants={fadeUp} className="w-[80px] shrink-0 snap-start" ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
        <Card href={href} className="flex flex-col items-center gap-2 border-none bg-transparent !shadow-none">
          <span className="flex size-16 items-center justify-center rounded-lg border border-border bg-surface text-accent shadow-sm [&_svg]:size-7">
            <CategoryIcon name={category.icon} />
          </span>
          <span dir="auto" className="line-clamp-2 text-center text-caption leading-tight text-foreground">{category.name}</span>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
      <Card href={href} className="relative flex h-full flex-col gap-4 overflow-hidden p-4">
        <span aria-hidden className="pointer-events-none absolute -end-6 -top-6 size-20 rounded-full bg-accent-soft" />
        <span className="relative flex size-12 items-center justify-center rounded-md bg-accent-soft text-accent [&_svg]:size-6">
          <CategoryIcon name={category.icon} />
        </span>
        <span className="relative">
          <span dir="auto" className="line-clamp-2 block text-card-title">{category.name}</span>
          {category.products_count !== undefined && (
            <span className="text-caption text-muted-foreground">{t("servicesCount", { count: category.products_count })}</span>
          )}
        </span>
      </Card>
    </motion.div>
  );
}
