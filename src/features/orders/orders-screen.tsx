"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MagnifyingGlass, Receipt } from "@phosphor-icons/react";
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
import { Money } from "@/components/shared/money";
import { ProductListSkeleton } from "@/features/products/product-list";
import type { OrderStatusGroup } from "@/lib/api/endpoints";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatRelative } from "@/lib/formatting/dates";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { DateRangeField } from "./date-range-field";
import { OrderStatusBadge } from "./order-status-badge";
import { useOrders } from "./queries";

type Filter = "all" | OrderStatusGroup;

function OrderCard({ order }: { order: Order }) {
  const locale = useLocale();
  return (
    <motion.li variants={fadeUp}>
      <Card href={`/orders/${order.id}`} className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p dir="auto" className="truncate text-card-title">{order.product.name}</p>
            <p className="text-caption text-muted-foreground" dir="ltr">{order.number}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center justify-between text-small">
          <span className="text-muted-foreground">{formatRelative(order.created_at, locale)}</span>
          <Money amountMinor={order.total_minor} currency={order.currency} />
        </div>
      </Card>
    </motion.li>
  );
}

function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <p className="text-caption text-muted-foreground">{label}</p>
      <div className="mt-1 text-section-title">{value}</div>
    </div>
  );
}

export function OrdersScreen() {
  const t = useTranslations("orders");
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
      <div className="relative">
        <MagnifyingGlass aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          enterKeyHint="search"
          className="ps-11"
        />
      </div>
      <DateRangeField from={from} to={to} onChange={({ from: nextFrom, to: nextTo }) => { setFrom(nextFrom); setTo(nextTo); }} />

      {orders.isPending ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[72px] rounded-lg" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 gap-2">
          <StatCard label={t("stats.total")} value={summary.total} />
          <StatCard label={t("stats.completed")} value={summary.completed} />
          <StatCard label={t("stats.failed")} value={summary.failed} />
          <StatCard label={t("stats.completedAmount")} value={<Money amountMinor={summary.completed_amount_minor} currency={summary.currency} className="text-section-title" />} />
        </div>
      ) : null}

      <SegmentedControl<Filter>
        label={t("title")}
        value={filter}
        onChange={setFilter}
        options={(["all", "active", "completed", "closed"] as const).map((value) => ({ value, label: t(`filters.${value}`) }))}
      />
      {orders.error ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : orders.isPending ? (
        <ProductListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title={filtered ? t("noResultsTitle") : t("emptyTitle")}
          body={filtered ? t("noResultsBody") : t("emptyBody")}
          action={!filtered ? <Link href="/categories" className="text-button text-accent">{t("browse")}</Link> : undefined}
        />
      ) : (
        <>
          <motion.ul key={`${filter}-${debouncedQuery}-${from}-${to}`} variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
            {items.map((order) => <OrderCard key={order.id} order={order} />)}
          </motion.ul>
          <LoadMore hasNext={Boolean(orders.hasNextPage)} isFetching={orders.isFetchingNextPage} onLoadMore={() => orders.fetchNextPage()} />
        </>
      )}
    </PageContainer>
  );
}
