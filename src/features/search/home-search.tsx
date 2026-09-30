"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ClockCounterClockwise, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Price } from "@/components/shared/money";
import { Section } from "@/components/shared/section";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { duration, spring } from "@/lib/animation/tokens";
import { prefetchImage } from "@/lib/images/prefetch-image";
import { CategoryIcon } from "@/features/categories/category-icon";
import { usePrefetchCategory, usePrefetchProduct } from "@/features/catalog/use-prefetch-catalog";
import { useHideKeyboard } from "@/lib/telegram/hooks";
import { ProductImage } from "@/features/products/product-image";
import { ProductListSkeleton } from "@/features/products/product-list";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import type { Category } from "@/entities/category/types";
import type { Product } from "@/entities/product/types";
import { Highlight } from "./highlight";
import { MIN_SEARCH_LENGTH, useCatalogSearch } from "./queries";
import { localeInputClassName, localeInputDir } from "@/lib/i18n/locale-input";
import { cn } from "@/lib/cn";
import { recentSearches } from "./recent-searches";

const DEBOUNCE_MS = 180;

function SearchProductHit({
  product,
  query,
  active,
  onSelect,
}: {
  product: Product;
  query: string;
  active: boolean;
  onSelect: () => void;
}) {
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchProduct<HTMLLIElement>(product.id, product.image_url);
  return (
    <li className="relative" ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch} onClick={onSelect}>
      <Card
        href={`/products/${product.id}`}
        className={active ? "flex items-center gap-3 bg-accent-soft p-2.5 pe-12 ring-2 ring-accent" : "flex items-center gap-3 p-2.5 pe-12"}
      >
        <ProductImage src={product.image_url} alt={product.name} sizes="56px" className="size-14 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <p dir="auto" className="truncate text-card-title">
            <Highlight text={product.name} query={query} />
          </p>
          {product.category && <p className="truncate text-caption text-muted-foreground">{product.category.name}</p>}
        </div>
        <div className="shrink-0">
          <Price price={product.price} />
        </div>
      </Card>
      <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute end-2.5 top-1/2 z-10 -translate-y-1/2" />
    </li>
  );
}

function SearchCategoryHit({ category, query, active }: { category: Category; query: string; active: boolean }) {
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchCategory<HTMLLIElement>(category.slug);
  return (
    <li ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
      <Card href={`/categories/${encodeURIComponent(category.slug)}`} className={active ? "flex items-center gap-2 bg-accent-soft p-3 ring-2 ring-accent" : "flex items-center gap-2 p-3"}>
        <CategoryIcon name={category.icon} className="size-4 shrink-0 text-accent" />
        <span dir="auto" className="truncate text-small font-medium">
          <Highlight text={category.name} query={query} />
        </span>
      </Card>
    </li>
  );
}

/** Live search that stays on the home screen: suggestions appear as the user types. */
export function HomeSearch({ onActiveChange }: { onActiveChange: (active: boolean) => void }) {
  const t = useTranslations("search");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const hideKeyboard = useHideKeyboard();
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>(() => recentSearches.read());
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);
  const search = useCatalogSearch(debounced);
  const active = debounced.trim().length >= MIN_SEARCH_LENGTH;

  useEffect(() => onActiveChange(active), [active, onActiveChange]);

  const categories = search.data?.categories ?? [];
  const products = search.data?.products ?? [];
  const hits = [
    ...categories.map((category) => ({ kind: "category" as const, href: `/categories/${encodeURIComponent(category.slug)}` })),
    ...products.map((product) => ({ kind: "product" as const, href: `/products/${product.id}` })),
  ];

  // A new query resets keyboard selection to the first hit.
  const [indexedQuery, setIndexedQuery] = useState(debounced);
  if (indexedQuery !== debounced) {
    setIndexedQuery(debounced);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (!search.data) return;
    for (const product of search.data.products.slice(0, 6)) prefetchImage(product.image_url);
    const firstCategory = search.data.categories[0];
    const firstProduct = search.data.products[0];
    if (firstCategory) router.prefetch(`/categories/${encodeURIComponent(firstCategory.slug)}`);
    else if (firstProduct) router.prefetch(`/products/${firstProduct.id}`);
  }, [search.data, router]);

  const remember = (value: string) => {
    if (value.trim().length >= MIN_SEARCH_LENGTH) setRecents(recentSearches.add(value.trim()));
  };

  const openHit = (index: number) => {
    const hit = hits[index];
    if (!hit) return;
    remember(query);
    router.push(hit.href);
  };

  const empty = active && search.data && categories.length === 0 && products.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          hideKeyboard();
          if (hits.length > 0) openHit(activeIndex);
          else remember(query);
        }}
        className="sticky top-[calc(var(--safe-top)+8px)] z-30 relative h-12 rounded-full border border-border bg-surface shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft"
      >
        <MagnifyingGlass aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          dir={localeInputDir(locale)}
          role="combobox"
          aria-expanded={active}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={hits[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          aria-label={t("placeholder")}
          placeholder={tHome("searchPlaceholder")}
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 160)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
              return;
            }
            if (!hits.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % hits.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => (index - 1 + hits.length) % hits.length);
            }
          }}
          className={cn(
            "h-full w-full rounded-full bg-transparent ps-11 text-base outline-none placeholder:text-muted-foreground",
            localeInputClassName,
            query ? "pe-14" : "pe-4",
          )}
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
              className="-me-1.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground active:bg-border-strong"
            >
              <X className="size-3.5" weight="bold" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {!active && focused && recents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.entrance} className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-section-title">{t("recent")}</h2>
            <button
              type="button"
              className="-me-2 min-h-11 rounded-full px-3 text-small text-muted-foreground active:bg-muted"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                recentSearches.clear();
                setRecents([]);
              }}
            >
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
        </motion.div>
      )}

      {active && search.error ? (
        <ErrorState error={search.error} onRetry={() => search.refetch()} />
      ) : active && !search.data ? (
        <ProductListSkeleton rows={4} />
      ) : empty ? (
        <EmptyState icon={<MagnifyingGlass />} title={t("noResultsTitle", { query: debounced })} body={t("noResultsBody")} />
      ) : active && search.data ? (
        <motion.div id={listId} role="listbox" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.entrance} className="flex flex-col gap-5" onClick={() => remember(query)}>
          {categories.length > 0 && (
            <Section title={t("suggestions")}>
              <ul className="grid gap-2">
                {categories.map((category, index) => (
                  <SearchCategoryHit key={category.id} category={category} query={debounced} active={activeIndex === index} />
                ))}
              </ul>
            </Section>
          )}
          {products.length > 0 && (
            <Section title={t("services")}>
              <ul className="flex flex-col gap-2.5">
                {products.map((product, index) => (
                  <SearchProductHit
                    key={product.id}
                    product={product}
                    query={debounced}
                    active={activeIndex === categories.length + index}
                    onSelect={() => remember(query)}
                  />
                ))}
              </ul>
            </Section>
          )}
        </motion.div>
      ) : null}
    </div>
  );
}
