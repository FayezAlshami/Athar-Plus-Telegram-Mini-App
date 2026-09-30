"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadMore } from "@/components/shared/load-more";
import { AnimatedHeartEmpty } from "@/components/illustrations/animated-icons";
import { ProductList, ProductListSkeleton } from "@/features/products/product-list";
import { isApiError } from "@/lib/api/errors";
import { useFavorites } from "./queries";

export function FavoritesScreen() {
  const t = useTranslations("favorites");
  const { data, isPending, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useFavorites();
  const items = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <PageContainer>
      <PageHeader title={t("title")} />
      {error ? (
        <ErrorState error={isApiError(error) && error.code === "not_found" ? t("listError") : error} onRetry={() => refetch()} />
      ) : isPending ? (
        <ProductListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<AnimatedHeartEmpty className="size-10" />}
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={<Link href="/categories" className="inline-flex h-11 items-center justify-center rounded-md bg-accent-soft px-5 text-button text-accent transition-transform duration-150 active:scale-[0.97]">{t("browse")}</Link>}
        />
      ) : (
        <>
          <ProductList products={items} showFavorite />
          <LoadMore hasNext={Boolean(hasNextPage)} isFetching={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
        </>
      )}
    </PageContainer>
  );
}
