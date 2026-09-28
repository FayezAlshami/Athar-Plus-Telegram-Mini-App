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

export function CampaignScreen({ slug }: { slug: string }) {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.campaign(slug),
    queryFn: ({ signal }) => catalogApi.campaign(slug, { signal }),
  });

  if (error) return <PageContainer withNav={false}><PageHeader title="" /><ErrorState error={error} onRetry={() => refetch()} /></PageContainer>;
  if (isPending) return <PageContainer withNav={false}><PageHeader title="" /><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-64 rounded-lg" /></PageContainer>;

  return (
    <PageContainer withNav={false}>
      <PageHeader title="" />
      <div className="rounded-xl bg-[image:var(--hero-gradient)] p-6 text-white shadow-lg">
        <AnimatedWords as="h1" text={data.title} className="text-display" />
      </div>
      {data.description.length > 0 && <StructuredText blocks={data.description} />}
      <ProductList products={data.products} />
    </PageContainer>
  );
}
