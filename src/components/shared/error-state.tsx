"use client";

import { useTranslations } from "next-intl";
import { WarningCircle, WifiSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";
import { useErrorMessage } from "@/lib/api/use-error-message";
import { EmptyState } from "./empty-state";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations();
  const message = useErrorMessage();
  const body = typeof error === "string" ? error : message(error);
  const offline = isApiError(error) && error.isNetworkError;

  return (
    <EmptyState
      icon={offline ? <WifiSlash /> : <WarningCircle />}
      title={t("errors.genericTitle")}
      body={body}
      action={onRetry && <Button variant="secondary" onClick={onRetry}>{t("common.retry")}</Button>}
    />
  );
}
