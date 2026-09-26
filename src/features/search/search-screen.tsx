"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ClockCounterClockwise, MagnifyingGlass, X } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Price } from "@/components/shared/money";
import { Section } from "@/components/shared/section";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { duration, spring } from "@/lib/animation/tokens";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { track } from "@/lib/analytics/events";
import { useHomeFeed } from "@/features/categories/queries";
import { CategoryIcon } from "@/features/categories/category-icon";
import { ProductListSkeleton, ProductList } from "@/features/products/product-list";
import { ProductImage } from "@/features/products/product-image";
import { Highlight } from "./highlight";
import { MIN_SEARCH_LENGTH, useCatalogSearch } from "./queries";
import { recentSearches } from "./recent-searches";

const DEBOUNCE_MS = 220;

export function SearchScreen() {
  const t = useTranslations("search");
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>(() => recentSearches.read());
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);
  const search = useCatalogSearch(debounced);
  const home = useHomeFeed();
  const active = debounced.trim().length >= MIN_SEARCH_LENGTH;

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    if (active && search.data) track("search_performed", { results: search.data.products.length });
  }, [active, search.data]);

  const remember = () => {
    if (query.trim().length >= MIN_SEARCH_LENGTH) setRecents(recentSearches.add(query.trim()));
  };

  const results = search.data;
  const empty = active && results && results.products.length === 0 && results.categories.length === 0;

  return (
    <PageContainer withNav={false}>
      <motion.form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          remember();
          inputRef.current?.blur();
        }}
        initial={{ opacity: 0, scaleX: 0.92 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={spring.entrance}
        className="sticky top-[calc(var(--safe-top)+8px)] z-30 flex h-12 items-center gap-2 rounded-full border border-border-strong bg-surface-elevated px-4 shadow-md focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft"
      >
        <MagnifyingGlass aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          dir="auto"
          aria-label={t("placeholder")}
          placeholder={t("placeholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && setQuery("")}
          className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              aria-label={t("clear")}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: duration.fast }}
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <X className="size-3.5" weight="bold" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.form>

      {!active ? (
        <>
          {recents.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-section-title">{t("recent")}</h2>
                <button type="button" className="text-small text-muted-foreground" onClick={() => { recentSearches.clear(); setRecents([]); }}>
                  {t("clearRecent")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recents.map((item) => (
                  <Chip key={item} icon={<ClockCounterClockwise />} onClick={() => setQuery(item)}>
                    {item}
                  </Chip>
                ))}
              </div>
            </section>
          )}
          {home.data && home.data.popular_products.length > 0 && (
            <Section title={t("popular")}>
              <ProductList products={home.data.popular_products} />
            </Section>
          )}
        </>
      ) : search.error ? (
        <ErrorState error={search.error} onRetry={() => search.refetch()} />
      ) : !results ? (
        <ProductListSkeleton rows={4} />
      ) : empty ? (
        <EmptyState icon={<MagnifyingGlass />} title={t("noResultsTitle", { query: debounced })} body={t("noResultsBody")} />
      ) : (
        <motion.div key={debounced} variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-6" onClick={remember}>
          {results.categories.length > 0 && (
            <Section title={t("categories")}>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((category) => (
                  <Link key={category.id} href={`/categories/${category.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3.5 text-small font-medium">
                    <CategoryIcon name={category.icon} className="size-4 text-accent" />
                    <Highlight text={category.name} query={debounced} />
                  </Link>
                ))}
              </div>
            </Section>
          )}
          {results.products.length > 0 && (
            <Section title={t("services")}>
              <ul className="flex flex-col gap-2.5">
                {results.products.map((product) => (
                  <motion.li key={product.id} variants={fadeUp}>
                    <Card href={`/products/${product.id}`} className="flex items-center gap-3 p-2.5">
                      <ProductImage src={product.image_url} alt={product.name} sizes="56px" className="size-14 shrink-0 rounded-md" />
                      <div className="min-w-0 flex-1">
                        <p dir="auto" className="truncate text-card-title"><Highlight text={product.name} query={debounced} /></p>
                        {product.category && <p className="truncate text-caption text-muted-foreground">{product.category.name}</p>}
                      </div>
                      <Price price={product.price} />
                    </Card>
                  </motion.li>
                ))}
              </ul>
            </Section>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
}
