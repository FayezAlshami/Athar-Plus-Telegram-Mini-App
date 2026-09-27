"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

export function LoadMore({
  hasNext,
  isFetching,
  onLoadMore,
}: {
  hasNext: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}) {
  const t = useTranslations("common");
  const ref = useInfiniteScroll(hasNext, isFetching, onLoadMore);
  if (!hasNext) return null;

  return (
    <div ref={ref} className="flex justify-center">
      <Button variant="ghost" loading={isFetching} onClick={onLoadMore}>
        {t("loadMore")}
      </Button>
    </div>
  );
}
