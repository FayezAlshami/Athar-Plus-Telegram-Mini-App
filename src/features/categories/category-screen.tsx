"use client";

import { useTranslations } from "next-intl";
import { Package } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadMore } from "@/components/shared/load-more";
import { ProductList, ProductListSkeleton } from "@/features/products/product-list";
import { gridContainer } from "@/lib/animation/variants";
import { CategoryCard } from "./category-card";
import { useCategory, useCategoryProducts } from "./queries";

export function CategoryScreen({ slug }: { slug: string }) {
  const t = useTranslations();
  const category = useCategory(slug);
  const products = useCategoryProducts(slug);
  const items = products.data?.pages.flatMap((page) => page.data) ?? [];
  const children = category.data?.children ?? [];

  return (
    <PageContainer>
      {category.data ? (
        <PageHeader title={category.data.name} />
      ) : category.error ? (
        <PageHeader title={t("categories.title")} />
      ) : (
        <div className="flex min-h-11 items-center gap-3" role="status" aria-busy="true">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
      )}
      {category.data?.description && <p dir="auto" className="-mt-3 text-small text-muted-foreground">{category.data.description}</p>}

      {children.length > 0 && (
        <motion.div variants={gridContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {children.map((child, index) => (
            <CategoryCard key={child.id} category={child} featured={index === 0 && Boolean(child.image_url)} />
          ))}
        </motion.div>
      )}

      {products.error ? (
        <ErrorState error={products.error} onRetry={() => products.refetch()} />
      ) : products.isPending ? (
        <ProductListSkeleton />
      ) : items.length === 0 ? (
        children.length === 0 && <EmptyState icon={<Package />} title={t("categories.emptyTitle")} />
      ) : (
        <>
          <ProductList products={items} showFavorite />
          <LoadMore hasNext={Boolean(products.hasNextPage)} isFetching={products.isFetchingNextPage} onLoadMore={() => products.fetchNextPage()} />
        </>
      )}
    </PageContainer>
  );
}
