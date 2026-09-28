"use client";

import { useTranslations } from "next-intl";
import { Package } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProductList, ProductListSkeleton } from "@/features/products/product-list";
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
