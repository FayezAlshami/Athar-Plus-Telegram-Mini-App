"use client";

import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FaqList } from "./faq-list";
import { useFaqs } from "./queries";

export function FaqScreen() {
  const t = useTranslations("faq");
  const { data, error, refetch, isLoading, isFetching, isFetched } = useFaqs();

  const initialLoading = isLoading || (isFetching && !isFetched);
  const refreshing = isFetching && isFetched;

  return (
    <PageContainer>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {refreshing && (
        <p className="-mt-2 mb-2 text-center text-caption text-muted-foreground" aria-live="polite">{t("refreshing")}</p>
      )}
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : initialLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label={t("loading")}>
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          <p className="text-center text-caption text-muted-foreground">{t("loading")}</p>
        </div>
      ) : data && data.length > 0 ? (
        <FaqList faqs={data} />
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-surface-sunken px-4 py-8 text-center text-caption text-muted-foreground">{t("empty")}</p>
      )}
    </PageContainer>
  );
}
