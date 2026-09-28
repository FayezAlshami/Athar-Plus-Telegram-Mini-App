"use client";

import { useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "@/components/ui/toast";
import { draftStore } from "./draft-store";

const announced = new Set<string>();

/** Restores a session draft once, then keeps writing the form as the user types. */
export function useFormDraft<T extends FieldValues>(key: string, form: UseFormReturn<T>) {
  const t = useTranslations("common");

  useEffect(() => {
    const saved = draftStore.read<T>(key);
    if (saved && !announced.has(key)) {
      announced.add(key);
      form.reset(saved);
      toast.message(t("draftRestored"));
    }

    const subscription = form.watch((values) => {
      draftStore.write(key, values);
    });
    return () => subscription.unsubscribe();
  }, [form, key, t]);

  return {
    clear() {
      announced.delete(key);
      draftStore.clear(key);
    },
  };
}
