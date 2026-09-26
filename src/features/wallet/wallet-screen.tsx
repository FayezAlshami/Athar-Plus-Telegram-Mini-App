"use client";

import { useTranslations } from "next-intl";
import { Receipt } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
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
      <PageHeader title={t("wallet.title")} showBack={false} />
      {wallet.error ? <ErrorState error={wallet.error} onRetry={() => wallet.refetch()} /> : <WalletCard wallet={wallet.data} />}

      <Section title={t("wallet.history")}>
        {transactions.error ? (
          <ErrorState error={transactions.error} onRetry={() => transactions.refetch()} />
        ) : transactions.isPending ? (
          <Skeleton className="h-64 rounded-lg" />
        ) : items.length === 0 ? (
          <EmptyState icon={<Receipt />} title={t("wallet.emptyTitle")} body={t("wallet.emptyBody")} />
        ) : (
          <>
            <TransactionList transactions={items} />
            {transactions.hasNextPage && (
              <Button variant="ghost" loading={transactions.isFetchingNextPage} onClick={() => transactions.fetchNextPage()}>
                {t("common.seeAll")}
              </Button>
            )}
          </>
        )}
      </Section>
    </PageContainer>
  );
}
