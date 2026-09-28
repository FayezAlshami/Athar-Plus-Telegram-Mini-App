"use client";

import { useState } from "react";
import Image from "next/image";
import { CategoryIcon } from "@/features/categories/category-icon";
import { canOptimizeImage } from "@/lib/images/optimizable";
import { cn } from "@/lib/cn";

/** Product visual with a branded fallback when the image fails or is missing. */
export function ProductImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div className={cn("relative overflow-hidden bg-[image:var(--hero-gradient)]", className)}>
      {showImage && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!canOptimizeImage(src)}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          className={cn("object-cover transition-opacity duration-300", loadedSrc === src ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-white/80 [&_svg]:size-1/3">
          <CategoryIcon name={null} />
        </div>
      )}
    </div>
  );
}
