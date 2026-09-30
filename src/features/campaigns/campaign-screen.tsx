"use client";

import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedWords } from "@/components/shared/animated-words";
import { ErrorState } from "@/components/shared/error-state";
import { StructuredText } from "@/components/shared/structured-text";
import { catalogApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { ProductList } from "@/features/products/product-list";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { miniAppDeepLink } from "@/lib/telegram/start-param";

export function CampaignScreen({ slug }: { slug: string }) {
  const t = useTranslations();
  const telegram = useTelegramState();
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.campaign(slug),
    queryFn: ({ signal }) => catalogApi.campaign(slug, { signal }),
  });

  if (error) return <PageContainer><PageHeader title="" /><ErrorState error={error} onRetry={() => refetch()} /></PageContainer>;
  if (isPending) return <PageContainer><PageHeader title="" /><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-64 rounded-lg" /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader title="" />
      <div className="rounded-xl bg-[image:var(--hero-gradient)] p-6 text-white shadow-lg">
        <AnimatedWords as="h1" text={data.title} className="text-display" />
      </div>
      {data.description.length > 0 && <StructuredText blocks={data.description} />}
      {data.image_url && (
        <Button
          variant="secondary"
          onClick={() => {
            const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
            const link = bot ? miniAppDeepLink(bot, `campaign_${slug}`) : data.image_url;
            if (telegram.status === "ready" && data.image_url) {
              telegram.adapter.shareToStory(data.image_url, {
                text: data.title,
                widgetLink: link ? { url: link, name: t("product.shareStory") } : undefined,
              });
              return;
            }
            if (link) window.open(link, "_blank", "noopener,noreferrer");
          }}
        >
          {t("product.shareStory")}
        </Button>
      )}
      <ProductList products={data.products} />
    </PageContainer>
  );
}
