import { cn } from "@/lib/cn";

/** Layout-preserving placeholder with a subtle shimmer. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative overflow-hidden rounded-sm bg-muted", className)}>
      <div className="absolute inset-0 animate-[shimmer_1.6s_infinite] rtl:[animation-direction:reverse] bg-gradient-to-r from-transparent via-surface-elevated/50 to-transparent" />
    </div>
  );
}
