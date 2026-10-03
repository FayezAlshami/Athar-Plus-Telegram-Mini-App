"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { Wallet } from "@/entities/wallet/types";
import { accountApi, type LiveSnapshot } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { useTelegramActive } from "@/lib/telegram/telegram-provider";

const INTERVAL_MS = 3_000;

/** Polls a small snapshot so notifications, balance, orders, and the open product update without a refresh. */
export function useLiveFeed() {
  const active = useTelegramActive();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const product = pathname.match(/^\/products\/([^/]+)$/)?.[1];
  const order = pathname.match(/^\/orders\/([^/]+)$/)?.[1];

  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let timer = 0;
    let previous: LiveSnapshot | null = null;

    const tick = async () => {
      try {
        const next = await accountApi.live({ product, order });
        if (previous) applyLiveSnapshot(queryClient, previous, next, product);
        previous = next;
      } catch {
        // A missed tick retries. The screen keeps the last known data.
      } finally {
        if (!stopped) timer = window.setTimeout(() => void tick(), INTERVAL_MS);
      }
    };

    timer = window.setTimeout(() => void tick(), 600);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [active, order, product, queryClient]);
}

function applyLiveSnapshot(queryClient: QueryClient, previous: LiveSnapshot, next: LiveSnapshot, openProduct?: string) {
  const balanceChanged = previous.wallet.balance_minor !== next.wallet.balance_minor || previous.wallet.updated_at !== next.wallet.updated_at;
  if (balanceChanged) {
    queryClient.setQueryData<Wallet>(queryKeys.wallet, (current) => (current ? { ...current, balance_minor: next.wallet.balance_minor } : current));
    void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
    void queryClient.invalidateQueries({ queryKey: queryKeys.walletTransactions });
    void queryClient.invalidateQueries({ queryKey: queryKeys.deposits });
  }

  if (previous.notifications.latest_id !== next.notifications.latest_id || previous.notifications.unread !== next.notifications.unread) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  }

  const orderSignature = (snapshot: LiveSnapshot) => snapshot.orders.map((item) => `${item.id}:${item.status}`).join("|");
  if (orderSignature(previous) !== orderSignature(next)) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
    for (const item of next.orders) {
      const before = previous.orders.find((order) => order.id === item.id);
      if (!before || before.status !== item.status) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.order(item.id) });
      }
    }
  }

  if (previous.catalog_updated_at !== next.catalog_updated_at) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.productsRoot });
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    if (openProduct) void queryClient.invalidateQueries({ queryKey: queryKeys.product(openProduct) });
  }

  const productChanged = JSON.stringify(previous.product) !== JSON.stringify(next.product);
  if (productChanged && openProduct) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.product(openProduct) });
  }
}
