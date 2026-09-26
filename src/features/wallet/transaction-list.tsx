"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Gift, ArrowCounterClockwise, SlidersHorizontal, Receipt } from "@phosphor-icons/react";
import type { WalletTransaction, WalletTransactionType } from "@/entities/wallet/types";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Money } from "@/components/shared/money";
import { formatDateTime } from "@/lib/formatting/dates";
import { fadeIn } from "@/lib/animation/variants";
import { cn } from "@/lib/cn";

const TYPE_ICONS: Record<WalletTransactionType, typeof Receipt> = {
  deposit: ArrowDownLeft,
  purchase: ArrowUpRight,
  refund: ArrowCounterClockwise,
  gift_code: Gift,
  adjustment: SlidersHorizontal,
};

export function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  const t = useTranslations("wallet.transactionType");
  const locale = useLocale();

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <ListGroup>
        {transactions.map((transaction) => {
          const Icon = TYPE_ICONS[transaction.type];
          const credit = transaction.direction === "credit";
          return (
            <ListItem
              key={transaction.id}
              icon={<Icon className={credit ? "text-success" : "text-foreground"} />}
              title={t(transaction.type)}
              subtitle={formatDateTime(transaction.created_at, locale)}
              trailing={
                <span className={cn("text-card-title", credit ? "text-success" : "text-foreground")} dir="ltr">
                  {credit ? "+" : "−"}
                  <Money amountMinor={transaction.amount_minor} currency={transaction.currency} />
                </span>
              }
            />
          );
        })}
      </ListGroup>
    </motion.div>
  );
}
