"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MagnifyingGlass, SquaresFour } from "@phosphor-icons/react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { gridContainer } from "@/lib/animation/variants";
import { useCategories } from "./queries";
import { CategoryCard } from "./category-card";

export function CategoriesScreen() {
  const t = useTranslations();
  const { data, isPending, error, refetch } = useCategories();

  return (
    <PageContainer>
      <PageHeader
        title={t("categories.title")}
        trailing={
          <Link href="/search" aria-label={t("nav.search")} className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-sm transition-transform duration-150 active:scale-95">
            <MagnifyingGlass className="size-[22px]" />
          </Link>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="status" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : data.length === 0 ? (
        <EmptyState icon={<SquaresFour />} title={t("categories.emptyTitle")} />
      ) : (
        <motion.div variants={gridContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.map((category) => <CategoryCard key={category.id} category={category} />)}
        </motion.div>
      )}
    </PageContainer>
  );
}
