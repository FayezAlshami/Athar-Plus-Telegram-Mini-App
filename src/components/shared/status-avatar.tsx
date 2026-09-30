import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

const RING_PX = 2;
const GAP_PX = 2;

/** Circular avatar with a navy-to-teal ring, even gap, and a green availability dot. */
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
  const outer = size + 2 * (RING_PX + GAP_PX);
  const dot = size >= 60 ? 14 : 12;

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: outer, height: outer }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[image:var(--wallet-card-gradient)]" />
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-background"
        style={{ inset: RING_PX }}
      />
      <Avatar
        name={name}
        src={src}
        size={size}
        className="relative z-[1] shrink-0 overflow-hidden rounded-full leading-none [&_img]:block [&_img]:size-full [&_img]:rounded-full [&_img]:object-cover"
      />
      <span
        className="absolute z-[2] rounded-full bg-success ring-2 ring-background"
        style={{ width: dot, height: dot, bottom: RING_PX - 1, insetInlineEnd: RING_PX - 1 }}
        aria-hidden={availableLabel ? undefined : true}
        title={availableLabel}
      />
    </span>
  );
}
