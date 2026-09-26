"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Receipt } from "@phosphor-icons/react";
import type { Order } from "@/entities/order/types";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Money } from "@/components/shared/money";
import { ProductListSkeleton } from "@/features/products/product-list";
import type { OrderStatusGroup } from "@/lib/api/endpoints";
import { formatRelative } from "@/lib/formatting/dates";
import { fadeUp, listContainer } from "@/lib/animation/variants";
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

export function OrdersScreen() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState<Filter>("all");
  const orders = useOrders(filter === "all" ? undefined : filter);
  const items = orders.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <PageContainer>
      <PageHeader title={t("title")} showBack={false} />
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
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={<Link href="/categories" className="text-button text-accent">{t("browse")}</Link>}
        />
      ) : (
        <>
          <motion.ul key={filter} variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
            {items.map((order) => <OrderCard key={order.id} order={order} />)}
          </motion.ul>
          {orders.hasNextPage && (
            <Button variant="ghost" loading={orders.isFetchingNextPage} onClick={() => orders.fetchNextPage()}>
              {tCommon("seeAll")}
            </Button>
          )}
        </>
      )}
    </PageContainer>
  );
}
