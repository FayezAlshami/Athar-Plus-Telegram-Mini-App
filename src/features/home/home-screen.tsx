"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
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
import { HomeHeader } from "./home-header";

function SearchTrigger() {
  const t = useTranslations("home");
  return (
    <Link
      href="/search"
      className="flex h-12 items-center gap-3 rounded-full border border-border bg-surface px-4 text-muted-foreground shadow-sm transition-transform active:scale-[0.99]"
    >
      <MagnifyingGlass className="size-5" />
      <span className="truncate text-small">{t("searchPlaceholder")}</span>
    </Link>
  );
}

export function HomeScreen() {
  const t = useTranslations();
  const feed = useHomeFeed();
  const wallet = useWallet();

  return (
    <PageContainer>
      <HomeHeader />
      <SearchTrigger />
      <WalletCard wallet={wallet.data} compact />

      {feed.error ? (
        <ErrorState error={feed.error} onRetry={() => feed.refetch()} />
      ) : (
        <>
          {feed.data ? <BannerCarousel banners={feed.data.banners} /> : <Skeleton className="h-40 rounded-xl" />}

          <Section title={t("home.categories")} action={{ label: t("common.seeAll"), href: "/categories" }}>
            {feed.data ? (
              <motion.div variants={listContainer} initial="hidden" animate="visible" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
                {feed.data.categories.map((category) => <CategoryCard key={category.id} category={category} compact />)}
              </motion.div>
            ) : (
              <div className="flex gap-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="size-16 rounded-lg" />)}</div>
            )}
          </Section>

          {(!feed.data || feed.data.featured_products.length > 0) && (
            <Section title={t("home.featured")}>
              {feed.data ? <ProductRail products={feed.data.featured_products} /> : <ProductRailSkeleton />}
            </Section>
          )}

          <Link href="/membership" className="block transition-transform active:scale-[0.99]">
            <PlusCard title={t("home.plusTitle")}>
              <p className="text-small text-[#f4e9cf]/80">{t("home.plusBody")}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold text-[#d3b068]">
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
      )}
    </PageContainer>
  );
}
