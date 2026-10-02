"use client";

import { formatMoney } from "@/lib/formatting/money";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Lightning, ShareNetwork, ShieldCheck, UserGear } from "@phosphor-icons/react";
import { useFixedBottomInset } from "@/components/layout/bottom-inset";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Price } from "@/components/shared/money";
import { StructuredText } from "@/components/shared/structured-text";
import { spring } from "@/lib/animation/tokens";
import { fadeUp, listContainer } from "@/lib/animation/variants";
import { track } from "@/lib/analytics/events";
import { FavoriteToggle } from "@/features/favorites/favorite-toggle";
import { useProfile } from "@/features/memberships/queries";
import { useTelegramBottomButtons } from "@/lib/telegram/hooks";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { miniAppDeepLink, productStartParam } from "@/lib/telegram/start-param";
import { sharePreparedCard } from "@/features/share/share-card";
import { ProductImage } from "./product-image";
import { PurchaseSheet } from "./purchase-sheet";
import { VariantPicker } from "./variant-picker";
import { useProduct } from "./queries";

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true">
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-8 w-28" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

/** Fixed purchase bar used outside Telegram. Portaled so page transitions can't displace it. */
function BuyBar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFixedBottomInset(ref);

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={spring.entrance}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[calc(var(--safe-bottom)+12px)] pt-3 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-[var(--content-max-width)] flex-col gap-2 ps-[max(1rem,var(--safe-left))] pe-[max(1rem,var(--safe-right))]">
        {children}
      </div>
    </motion.div>,
    document.body,
  );
}

export function ProductScreen({ idOrSlug }: { idOrSlug: string }) {
  const t = useTranslations();
  const { data: product, isPending, error, refetch } = useProduct(idOrSlug);
  const profile = useProfile();
  const telegram = useTelegramState();
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [variantId, setVariantId] = useState<number | null>(null);
  const variants = product?.variants ?? [];
  const selectedVariant = variants.find((item) => item.id === variantId) ?? variants[0] ?? null;
  const activePrice = selectedVariant?.price ?? product?.price;

  const shareFallback = () => {
    if (!product) return;
    const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!bot) return;
    const startParam = productStartParam(product.id, profile.data?.referral.code);
    const url = miniAppDeepLink(bot, startParam);
    const share = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("product.shareText"))}`;
    if (telegram.status === "ready") telegram.adapter.openTelegramLink(share);
    else window.open(share, "_blank", "noopener,noreferrer");
  };

  const shareProduct = () => {
    if (!product) return;
    if (telegram.status !== "ready") {
      shareFallback();
      return;
    }
    void sharePreparedCard(telegram.adapter, { type: "product", product_id: product.id }, shareFallback);
  };

  const { usingNative } = useTelegramBottomButtons({
    active: Boolean(product) && !purchaseOpen,
    main: product
      ? {
          text: product.is_purchasable && activePrice
            ? t("product.buyFor", { price: formatMoney(activePrice.final_minor, activePrice.currency) })
            : t("product.unavailable"),
          enabled: product.is_purchasable,
          onClick: () => setPurchaseOpen(true),
        }
      : null,
    secondary: product ? { text: t("product.share"), onClick: shareProduct } : null,
  });

  useEffect(() => {
    if (product) track("product_viewed", { product_id: product.id });
  }, [product]);

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="" />
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  if (isPending) {
    return (
      <PageContainer>
        <PageHeader title="" />
        <ProductSkeleton />
      </PageContainer>
    );
  }

  const FulfillmentIcon = product.fulfillment_type === "inventory" ? Lightning : UserGear;

  return (
    <>
      <PageContainer>
        <PageHeader title={product.category?.name ?? ""} />
        <motion.div variants={listContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
          <motion.div variants={fadeUp} className="relative">
            <ProductImage src={product.image_url} alt={product.name} sizes="(max-width: 640px) 100vw, 640px" priority expandable className="aspect-[16/10] rounded-xl shadow-md" />
            {/* z-20 keeps the heart above the image's tap-to-expand layer. */}
            <FavoriteToggle productId={product.id} isFavorite={Boolean(product.is_favorite)} className="absolute end-3 top-3 z-20" />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <h1 dir="auto" className="text-display text-balance">{product.name}</h1>
            {product.summary && <p dir="auto" className="text-body text-muted-foreground">{product.summary}</p>}
            {variants.length > 0 && (
              <VariantPicker variants={variants} value={selectedVariant?.id ?? null} onChange={setVariantId} />
            )}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Price price={activePrice ?? product.price} size="lg" showLocal />
              {(activePrice ?? product.price).discount_minor > 0 && (
                <Badge tone={(activePrice ?? product.price).membership_discount_minor > 0 ? "gold" : "success"}>
                  {t("product.youSave", { amount: formatMoney((activePrice ?? product.price).discount_minor, (activePrice ?? product.price).currency) })}
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

      {!usingNative && (
        <BuyBar>
          <div className="flex items-center gap-2">
            <Button size="lg" fullWidth disabled={!product.is_purchasable} onClick={() => setPurchaseOpen(true)} haptic="medium">
              {product.is_purchasable && activePrice
                ? t("product.buyFor", { price: formatMoney(activePrice.final_minor, activePrice.currency) })
                : t("product.unavailable")}
            </Button>
            <Button size="lg" variant="secondary" aria-label={t("product.share")} onClick={shareProduct} haptic="light" className="shrink-0 px-4">
              <ShareNetwork className="size-5" />
            </Button>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-center text-caption text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-success" weight="fill" />
            {t("product.secureNote")}
          </p>
        </BuyBar>
      )}

      {product.is_purchasable && (
        <PurchaseSheet
          product={product}
          open={purchaseOpen}
          onOpenChange={setPurchaseOpen}
          variantId={selectedVariant?.id ?? null}
          onVariantChange={setVariantId}
        />
      )}
    </>
  );
}
