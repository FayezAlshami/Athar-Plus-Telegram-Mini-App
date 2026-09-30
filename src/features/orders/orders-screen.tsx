"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CheckCircle, Copy, MagnifyingGlass, Receipt, Stack, WarningCircle, X } from "@phosphor-icons/react";
import type { Order } from "@/entities/order/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadMore } from "@/components/shared/load-more";
import { CopyableText } from "@/components/shared/copyable-text";
import { Money } from "@/components/shared/money";
import { ProductImage } from "@/features/products/product-image";
import { ProductListSkeleton } from "@/features/products/product-list";
import type { OrderStatusGroup } from "@/lib/api/endpoints";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRelative } from "@/lib/formatting/dates";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { useHideKeyboard } from "@/lib/telegram/hooks";
import { localeInputClassName, localeInputDir } from "@/lib/i18n/locale-input";
import { cn } from "@/lib/cn";
import { DateRangeField } from "./date-range-field";
import { OrderStatusBadge } from "./order-status-badge";
import { useOrders } from "./queries";

type Filter = "all" | OrderStatusGroup;

const STATUS_BAR: Record<Order["status"], string> = {
  pending: "bg-warning",
  confirmed: "bg-accent",
  processing: "bg-accent",
  completed: "bg-success",
  cancelled: "bg-danger",
  rejected: "bg-danger",
};

function OrderCard({ order }: { order: Order }) {
  const t = useTranslations("orders");
  const locale = useLocale();
  return (
    <motion.li variants={fadeUp}>
      <Card className="relative overflow-hidden">
        <span aria-hidden className={cn("absolute inset-y-0 start-0 w-[3px]", STATUS_BAR[order.status])} />
        <Link href={`/orders/${order.id}`} aria-label={order.product.name ?? t("title")} className="absolute inset-0 z-0" />
        <div className="pointer-events-none relative z-10 flex items-center gap-3 p-3 ps-4">
          <ProductImage src={order.product.image_url} alt="" sizes="56px" className="size-14 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p dir="auto" className="truncate text-card-title">{order.product.name}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <CopyableText
              value={order.number}
              label={t("copyNumber")}
              className="pointer-events-auto mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-sunken px-2 py-1 text-caption text-muted-foreground active:bg-muted"
            >
              <bdi dir="ltr" className="truncate">#{order.number}</bdi>
              <Copy className="size-3.5 shrink-0" />
            </CopyableText>
            <div className="mt-2 flex items-center justify-between gap-3 text-small">
              <span className="text-muted-foreground">{formatRelative(order.created_at, locale)}</span>
              <Money amountMinor={order.total_minor} currency={order.currency} />
            </div>
          </div>
        </div>
      </Card>
    </motion.li>
  );
}

const STAT_TONES = {
  navy: "bg-[#0f2a55] text-white",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
} as const;

function StatCard({ label, value, tone, icon }: { label: string; value: ReactNode; tone: keyof typeof STAT_TONES; icon: ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-lg p-3", STAT_TONES[tone])}>
      <span className="flex items-center justify-between gap-2 text-caption opacity-80">
        {label}
        <span className="[&_svg]:size-4">{icon}</span>
      </span>
      <div className="truncate text-section-title tabular-nums">{value}</div>
    </div>
  );
}

export function OrdersScreen() {
  const t = useTranslations("orders");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const hideKeyboard = useHideKeyboard();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const filtered = Boolean(debouncedQuery || from || to || filter !== "all");
  const orders = useOrders({
    status: filter === "all" ? undefined : filter,
    from: from || undefined,
    to: to || undefined,
    q: debouncedQuery || undefined,
  });
  const items = orders.data?.pages.flatMap((page) => page.data) ?? [];
  const summary = orders.data?.pages[0]?.summary;

  return (
    <PageContainer>
      <PageHeader title={t("title")} />

      {orders.isPending ? (
        <div className="grid grid-cols-2 gap-2" role="status" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[88px] rounded-lg" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 gap-2">
          <StatCard tone="navy" icon={<Stack weight="duotone" />} label={t("stats.total")} value={summary.total} />
          <StatCard tone="success" icon={<CheckCircle weight="duotone" />} label={t("stats.completed")} value={summary.completed} />
          <StatCard tone="danger" icon={<WarningCircle weight="duotone" />} label={t("stats.failed")} value={summary.failed} />
          <StatCard tone="accent" icon={<Receipt weight="duotone" />} label={t("stats.completedAmount")} value={<Money amountMinor={summary.completed_amount_minor} currency={summary.currency} className="text-section-title" />} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm">
        <form
          role="search"
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            hideKeyboard();
          }}
        >
          <MagnifyingGlass aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            inputMode="search"
            role="searchbox"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setQuery("")}
            dir={localeInputDir(locale)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            enterKeyHint="search"
            className={cn("ps-11 pe-14", localeInputClassName)}
          />
          {query && (
            <button
              type="button"
              aria-label={tSearch("clear")}
              onClick={() => setQuery("")}
              className="absolute end-2.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground active:bg-border-strong"
            >
              <X className="size-3.5" weight="bold" />
            </button>
          )}
        </form>
        <DateRangeField from={from} to={to} onChange={({ from: nextFrom, to: nextTo }) => { setFrom(nextFrom); setTo(nextTo); }} />
        <SegmentedControl<Filter>
          label={t("title")}
          value={filter}
          onChange={setFilter}
          options={(["all", "active", "completed", "closed"] as const).map((value) => ({ value, label: t(`filters.${value}`) }))}
        />
      </div>
      {orders.error ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : orders.isPending ? (
        <ProductListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title={filtered ? t("noResultsTitle") : t("emptyTitle")}
          body={filtered ? t("noResultsBody") : t("emptyBody")}
          action={!filtered ? <Link href="/categories" className="inline-flex h-11 items-center justify-center rounded-md bg-accent-soft px-5 text-button text-accent transition-transform duration-150 active:scale-[0.97]">{t("browse")}</Link> : undefined}
        />
      ) : (
        <>
          <motion.ul
            variants={listContainer}
            initial="hidden"
            animate="visible"
            aria-busy={orders.isPlaceholderData || undefined}
            className={cn("flex flex-col gap-2.5 transition-opacity duration-200", orders.isPlaceholderData && "opacity-50")}
          >
            {items.map((order) => <OrderCard key={order.id} order={order} />)}
          </motion.ul>
          <LoadMore hasNext={Boolean(orders.hasNextPage) && !orders.isPlaceholderData} isFetching={orders.isFetchingNextPage} onLoadMore={() => orders.fetchNextPage()} />
        </>
      )}
    </PageContainer>
  );
}
