"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Section } from "@/components/shared/section";
import { listContainer } from "@/lib/animation/variants";
import { BannerCarousel } from "@/features/banners/banner-carousel";
import { CategoryCard } from "@/features/categories/category-card";
import { useHomeFeed } from "@/features/categories/queries";
import { PlusCard } from "@/features/memberships/plus-card";
import { ProductRail, ProductRailSkeleton } from "@/features/products/product-rail";
import { WalletCard } from "@/features/wallet/wallet-card";
import { useWallet } from "@/features/wallet/queries";
import { isApiError } from "@/lib/api/errors";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import type { Category } from "@/entities/category/types";
import { HomeSearch } from "@/features/search/home-search";
import { HomeHeader } from "./home-header";

export function HomeScreen() {
  const t = useTranslations();
  const router = useRouter();
  const telegram = useTelegramState();
  const feed = useHomeFeed();
  const wallet = useWallet();
  const [cachedCategories, setCachedCategories] = useState<Category[] | null>(null);
  const [searching, setSearching] = useState(false);
  const onActiveChange = useCallback((active: boolean) => setSearching(active), []);

  useEffect(() => {
    const featured = feed.data?.featured_products.slice(0, 4) ?? [];
    for (const product of featured) router.prefetch(`/products/${product.id}`);
  }, [feed.data, router]);

  useEffect(() => {
    if (telegram.status !== "ready" || !feed.data?.categories.length) return;
    const slim = feed.data.categories.slice(0, 8).map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      image_url: category.image_url,
      accent_color: category.accent_color,
    }));
    void telegram.adapter.deviceSet("athar.recent-categories", JSON.stringify(slim));
  }, [feed.data, telegram]);

  useEffect(() => {
    if (telegram.status !== "ready" || !feed.error || !isApiError(feed.error) || !feed.error.isNetworkError) return;
    void telegram.adapter.deviceGet("athar.recent-categories").then((raw) => {
      if (!raw) return;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setCachedCategories(parsed as Category[]);
      } catch {
        setCachedCategories(null);
      }
    });
  }, [feed.error, telegram]);

  return (
    <PageContainer>
      <HomeHeader />
      <HomeSearch onActiveChange={onActiveChange} />
      {searching ? null : <WalletCard wallet={wallet.data} compact />}

      {!searching && (feed.error ? (
        <div className="flex flex-col gap-6">
          <ErrorState error={feed.error} onRetry={() => feed.refetch()} />
          {cachedCategories && cachedCategories.length > 0 && (
            <Section title={t("home.categories")}>
              <div className="scrollbar-none -mx-4 flex snap-x gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1">
                {cachedCategories.map((category) => <CategoryCard key={category.id} category={category} compact />)}
              </div>
            </Section>
          )}
        </div>
      ) : (
        <>
          {feed.data ? <BannerCarousel banners={feed.data.banners} /> : <Skeleton className="aspect-[2/1] max-h-52 min-h-40 rounded-xl" />}

          <Section title={t("home.categories")} action={{ label: t("common.seeAll"), href: "/categories" }}>
            {feed.data ? (
              <motion.div variants={listContainer} initial="hidden" animate="visible" className="scrollbar-none -mx-4 flex snap-x gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1">
                {feed.data.categories.map((category) => <CategoryCard key={category.id} category={category} compact />)}
              </motion.div>
            ) : (
              <div className="-mx-4 flex gap-2 overflow-hidden px-4 pb-1" role="status" aria-busy="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex w-[80px] shrink-0 flex-col items-center gap-2">
                    <Skeleton className="size-16 rounded-lg" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {(!feed.data || feed.data.featured_products.length > 0) && (
            <Section title={t("home.featured")}>
              {feed.data ? <ProductRail products={feed.data.featured_products} /> : <ProductRailSkeleton />}
            </Section>
          )}

          <Link href="/membership" className="block rounded-xl transition-transform duration-150 active:scale-[0.99]">
            <PlusCard title={t("home.plusTitle")}>
              <p className="text-small text-on-plus-muted">{t("home.plusBody")}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold text-gold">
                {t("home.plusCta")}
                <ArrowRight className="size-4 rtl:-scale-x-100" weight="bold" />
              </span>
            </PlusCard>
          </Link>

          {feed.data && feed.data.popular_products.length > 0 && (
            <Section title={t("home.popular")}>
              <ProductRail products={feed.data.popular_products} />
            </Section>
          )}
        </>
      ))}
    </PageContainer>
  );
}
