"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowDownLeft, Gift, ArrowCounterClockwise, SlidersHorizontal, ShoppingBagOpen } from "@phosphor-icons/react";
import type { WalletTransaction, WalletTransactionType } from "@/entities/wallet/types";
import { ListGroup, ListItem } from "@/components/ui/list-item";
import { Money } from "@/components/shared/money";
import { formatDateTime } from "@/lib/formatting/dates";
import { fadeIn } from "@/lib/animation/variants";
import { cn } from "@/lib/cn";

const TYPE_ICONS: Record<WalletTransactionType, typeof ShoppingBagOpen> = {
  deposit: ArrowDownLeft,
  purchase: ShoppingBagOpen,
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
          const purchase = transaction.type === "purchase";
          const tone = purchase ? "danger" : transaction.type === "deposit" ? "success" : transaction.type === "refund" ? "accent" : transaction.type === "gift_code" ? "gold" : "neutral";
          return (
            <ListItem
              key={transaction.id}
              iconTone={tone}
              icon={<Icon weight={purchase ? "duotone" : "bold"} />}
              title={t(transaction.type)}
              subtitle={formatDateTime(transaction.created_at, locale)}
              trailing={
                <span className={cn("shrink-0 text-card-title tabular-nums", credit ? "text-success" : purchase ? "text-danger" : "text-foreground")} dir="ltr">
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
