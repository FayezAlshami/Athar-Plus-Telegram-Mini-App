import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

/** Circular avatar with a navy-to-teal ring and a green availability dot. */
export function StatusAvatar({
  name,
  src,
  size = 44,
  availableLabel,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  availableLabel?: string;
  className?: string;
}) {
  const dot = size >= 60 ? "size-3.5" : "size-3";

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span className="rounded-full bg-[image:var(--wallet-card-gradient)] p-[2px]">
        <span className="block rounded-full bg-background p-[2px]">
          <Avatar name={name} src={src} size={size} />
        </span>
      </span>
      <span
        className={cn("absolute bottom-0 end-0 rounded-full bg-success ring-2 ring-background", dot)}
        aria-hidden={availableLabel ? undefined : true}
        title={availableLabel}
      />
    </span>
  );
}
