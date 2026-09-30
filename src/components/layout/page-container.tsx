import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Centered, safe-area-aware page frame. The bottom padding clears whichever fixed
 * bar is showing (bottom nav or a sticky CTA) through `--bottom-inset`.
 */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-[var(--content-max-width)] flex-col gap-6 pt-[calc(var(--safe-top)+12px)] ps-[max(1rem,var(--safe-left))] pe-[max(1rem,var(--safe-right))]",
        "pb-[calc(max(var(--bottom-inset,0px),var(--safe-bottom))+28px)]",
        className,
      )}
    >
      {children}
    </main>
  );
}
