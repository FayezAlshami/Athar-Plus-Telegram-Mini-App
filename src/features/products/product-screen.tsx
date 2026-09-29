"use client";

import { formatMoney } from "@/lib/formatting/money";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Lightning, ShareNetwork, ShieldCheck, UserGear } from "@phosphor-icons/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Price } from "@/components/shared/money";
import { StructuredText } from "@/components/shared/structured-text";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { track } from "@/lib/analytics/events";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import { useProfile } from "@/features/memberships/queries";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { miniAppDeepLink, productStartParam } from "@/lib/telegram/start-param";
import { ProductImage } from "./product-image";
import { PurchaseSheet } from "./purchase-sheet";
import { useProduct } from "./queries";

export function ProductScreen({ idOrSlug }: { idOrSlug: string }) {
  const t = useTranslations();
  const { data: product, isPending, error, refetch } = useProduct(idOrSlug);
  const profile = useProfile();
  const telegram = useTelegramState();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const shareProduct = () => {
    if (!product) return;
    const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!bot) return;
    const startParam = productStartParam(product.id, profile.data?.referral.code);
    const url = miniAppDeepLink(bot, startParam);
    const share = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("product.shareText"))}`;
    if (telegram.status === "ready") telegram.adapter.openTelegramLink(share);
    else window.open(share, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (product) track("product_viewed", { product_id: product.id });
  }, [product]);

  if (error) {
    return (
      <PageContainer withNav={false}>
        <PageHeader title="" />
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  if (isPending) {
    return (
      <PageContainer withNav={false}>
        <PageHeader title="" />
        <Skeleton className="aspect-[16/10] w-full rounded-xl" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </PageContainer>
    );
  }

  const FulfillmentIcon = product.fulfillment_type === "inventory" ? Lightning : UserGear;

  return (
    <>
      <PageContainer withNav={false}>
        <PageHeader title={product.category?.name ?? ""} />
        <motion.div variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
          <motion.div variants={fadeUp} className="relative">
            <ProductImage src={product.image_url} alt={product.name} sizes="(max-width: 640px) 100vw, 640px" priority className="aspect-[16/10] rounded-xl shadow-md" />
            <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute end-3 top-3" />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <h1 dir="auto" className="text-display">{product.name}</h1>
            {product.summary && <p dir="auto" className="text-body text-muted-foreground">{product.summary}</p>}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Price price={product.price} size="lg" showLocal />
              {product.price.discount_minor > 0 && (
                <Badge tone={product.price.membership_discount_minor > 0 ? "gold" : "success"}>
                  {t("product.youSave", { amount: formatMoney(product.price.discount_minor, product.price.currency) })}
                </Badge>
              )}
            </div>
          </motion.div>

          {product.description.length > 0 && (
            <motion.section variants={fadeUp} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
              <h2 className="text-section-title">{t("product.description")}</h2>
              <StructuredText blocks={product.description} />
            </motion.section>
          )}

          <motion.section variants={fadeUp} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <h2 className="text-section-title">{t("product.delivery")}</h2>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-sm bg-accent-soft text-accent">
                <FulfillmentIcon className="size-5" />
              </span>
              <span className="text-card-title">{t(`product.fulfillment.${product.fulfillment_type}`)}</span>
            </div>
            {product.delivery_note.length > 0 && <StructuredText blocks={product.delivery_note} />}
          </motion.section>
        </motion.div>
      </PageContainer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/92 pb-[calc(var(--safe-bottom)+12px)] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[var(--content-max-width)] flex-col gap-2 ps-[max(1rem,var(--safe-left))] pe-[max(1rem,var(--safe-right))]">
          <div className="flex items-center gap-2">
            <Button size="lg" fullWidth disabled={!product.is_purchasable} onClick={() => setPurchaseOpen(true)} haptic="medium">
              {product.is_purchasable
                ? t("product.buyFor", { price: formatMoney(product.price.final_minor, product.price.currency) })
                : t("product.unavailable")}
            </Button>
            <Button size="lg" variant="secondary" aria-label={t("product.share")} onClick={shareProduct} haptic="light" className="shrink-0 px-4">
              <ShareNetwork className="size-5" />
            </Button>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-caption text-muted-foreground">
            <ShieldCheck className="size-4 text-success" weight="fill" />
            {t("product.secureNote")}
          </p>
        </div>
      </div>

      {product.is_purchasable && <PurchaseSheet product={product} open={purchaseOpen} onOpenChange={setPurchaseOpen} />}
    </>
  );
}
