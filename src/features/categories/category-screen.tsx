"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { CaretRight, Package } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadMore } from "@/components/shared/load-more";
import { ProductList, ProductListSkeleton } from "@/features/products/product-list";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { CategoryIcon } from "./category-icon";
import { useCategory, useCategoryProducts } from "./queries";

export function CategoryScreen({ slug }: { slug: string }) {
  const t = useTranslations();
  const category = useCategory(slug);
  const products = useCategoryProducts(slug);
  const items = products.data?.pages.flatMap((page) => page.data) ?? [];
  const children = category.data?.children ?? [];

  return (
    <PageContainer withNav={false}>
      {category.data ? (
        <PageHeader title={category.data.name} />
      ) : (
        <div className="flex min-h-11 items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
      )}
      {category.data?.description && <p dir="auto" className="-mt-3 text-small text-muted-foreground">{category.data.description}</p>}

      {children.length > 0 && (
        <motion.div variants={listContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {children.map((child) => (
            <motion.div key={child.id} variants={fadeUp}>
              <Link
                href={`/categories/${encodeURIComponent(child.slug)}`}
                className="flex h-full items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm transition-transform duration-150 active:scale-[0.98]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent [&_svg]:size-5">
                  <CategoryIcon name={child.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span dir="auto" className="block truncate text-card-title">{child.name}</span>
                  {child.products_count !== undefined && (
                    <span className="block truncate text-caption text-muted-foreground">{t("categories.servicesCount", { count: child.products_count })}</span>
                  )}
                </span>
                <CaretRight aria-hidden className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
              </Link>
            </motion.div>
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
