import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Centered, safe-area-aware page frame. `withNav` reserves space for the bottom navigation. */
export function PageContainer({ children, withNav = true, className }: { children: ReactNode; withNav?: boolean; className?: string }) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-[var(--content-max-width)] flex-col gap-6 px-4 pt-[calc(var(--safe-top)+12px)]",
        withNav ? "pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+28px)]" : "pb-[calc(var(--safe-bottom)+120px)]",
        className,
      )}
    >
      {children}
    </main>
  );
}
