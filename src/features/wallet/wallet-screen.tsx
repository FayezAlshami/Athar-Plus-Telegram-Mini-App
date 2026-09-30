"use client";

import { useTranslations } from "next-intl";
import { Receipt } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadMore } from "@/components/shared/load-more";
import { Section } from "@/components/shared/section";
import { useWallet, useWalletTransactions } from "./queries";
import { TransactionList } from "./transaction-list";
import { WalletCard } from "./wallet-card";

export function WalletScreen() {
  const t = useTranslations();
  const wallet = useWallet();
  const transactions = useWalletTransactions();
  const items = transactions.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <PageContainer>
      <PageHeader title={t("wallet.title")} />
      {wallet.error ? <ErrorState error={wallet.error} onRetry={() => wallet.refetch()} /> : <WalletCard wallet={wallet.data} />}

      <Section title={t("wallet.history")}>
        {transactions.error ? (
          <ErrorState error={transactions.error} onRetry={() => transactions.refetch()} />
        ) : transactions.isPending ? (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface" role="status" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex min-h-[60px] items-center gap-3 px-4 py-2.5">
                <Skeleton className="size-10 rounded-sm" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Receipt />} title={t("wallet.emptyTitle")} body={t("wallet.emptyBody")} />
        ) : (
          <>
            <TransactionList transactions={items} />
            <LoadMore hasNext={Boolean(transactions.hasNextPage)} isFetching={transactions.isFetchingNextPage} onLoadMore={() => transactions.fetchNextPage()} />
          </>
        )}
      </Section>
    </PageContainer>
  );
}
