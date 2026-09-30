import { cn } from "@/lib/cn";

export function Avatar({ name, src, size = 44, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const initials = name.trim().slice(0, 1).toUpperCase();
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-accent font-semibold", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Telegram CDN avatars, tiny and pre-sized
        <img src={src} alt="" width={size} height={size} className="block size-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
