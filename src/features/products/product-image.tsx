import Image from "next/image";
import { CategoryIcon } from "@/features/categories/category-icon";
import { cn } from "@/lib/cn";

/** Product visual with a branded fallback when no image is configured. */
export function ProductImage({ src, alt, className, sizes, priority }: { src: string | null; alt: string; className?: string; sizes: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-[image:var(--hero-gradient)]", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-white/80 [&_svg]:size-1/3">
          <CategoryIcon name={null} />
        </div>
      )}
    </div>
  );
}
