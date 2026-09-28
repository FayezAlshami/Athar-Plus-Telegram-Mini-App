"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Package } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProductList, ProductListSkeleton } from "@/features/products/product-list";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { useCategory, useCategoryProducts } from "./queries";

export function CategoryScreen({ slug }: { slug: string }) {
  const t = useTranslations();
  const category = useCategory(slug);
  const products = useCategoryProducts(slug);
  const items = products.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <PageContainer withNav={false}>
      <PageHeader title={category.data?.name ?? ""} />
      {category.data?.description && <p className="-mt-3 text-small text-muted-foreground">{category.data.description}</p>}

      {category.data?.children && category.data.children.length > 0 && (
        <motion.div variants={listContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {category.data.children.map((child) => (
            <motion.div key={child.id} variants={fadeUp}>
              <Link href={`/categories/${child.slug}`} className="block rounded-lg border border-border bg-surface p-4 shadow-sm transition-transform active:scale-[0.99]">
                <p className="text-card-title">{child.name}</p>
                {child.products_count !== undefined && (
                  <p className="mt-1 text-caption text-muted-foreground">{t("categories.servicesCount", { count: child.products_count })}</p>
                )}
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
        <EmptyState icon={<Package />} title={t("categories.emptyTitle")} />
      ) : (
        <>
          <ProductList products={items} />
          {products.hasNextPage && (
            <Button variant="secondary" loading={products.isFetchingNextPage} onClick={() => products.fetchNextPage()}>
              {t("common.seeAll")}
            </Button>
          )}
        </>
      )}
    </PageContainer>
  );
}
