"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { Category } from "@/entities/category/types";
import { Card } from "@/components/ui/card";
import { fadeUp } from "@/lib/animation/variants";
import { CategoryIcon } from "./category-icon";

export function CategoryCard({ category, compact = false }: { category: Category; compact?: boolean }) {
  const t = useTranslations("categories");

  if (compact) {
    return (
      <motion.div variants={fadeUp} className="w-[84px] shrink-0">
        <Card href={`/categories/${category.slug}`} className="flex flex-col items-center gap-2 border-none bg-transparent !shadow-none">
          <span className="flex size-16 items-center justify-center rounded-lg border border-border bg-surface text-accent shadow-sm [&_svg]:size-7">
            <CategoryIcon name={category.icon} />
          </span>
          <span className="line-clamp-2 text-center text-caption text-foreground">{category.name}</span>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp}>
      <Card href={`/categories/${category.slug}`} className="flex h-full flex-col gap-4 p-4">
        <span className="flex size-12 items-center justify-center rounded-md bg-accent-soft text-accent [&_svg]:size-6">
          <CategoryIcon name={category.icon} />
        </span>
        <span>
          <span className="block text-card-title">{category.name}</span>
          {category.products_count !== undefined && (
            <span className="text-caption text-muted-foreground">{t("servicesCount", { count: category.products_count })}</span>
          )}
        </span>
      </Card>
    </motion.div>
  );
}
