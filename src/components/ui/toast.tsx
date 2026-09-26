"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/providers/theme-provider";

export { toast } from "sonner";

export function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      offset="calc(var(--safe-top) + 12px)"
      toastOptions={{
        classNames: {
          toast: "!rounded-md !border !border-border !bg-surface-elevated !text-foreground !shadow-lg !font-sans",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}
