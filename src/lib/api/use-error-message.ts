"use client";

import { useTranslations } from "next-intl";
import { isApiError } from "./errors";

/** Centralized user-facing error text. Backend messages are already localized via Accept-Language. */
export function useErrorMessage() {
  const t = useTranslations("errors");

  return (error: unknown): string => {
    if (!isApiError(error)) return t("unknown_error");
    if (error.isNetworkError) return t("network_error");
    if (error.code === "unknown_error" || !error.message) return t("unknown_error");
    return error.message;
  };
}
