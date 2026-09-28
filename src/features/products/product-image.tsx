"use client";

import { useState } from "react";
import Image from "next/image";
import { CategoryIcon } from "@/features/categories/category-icon";
import { cn } from "@/lib/cn";

function shouldSkipOptimizer(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const apiHost = apiBase ? new URL(apiBase).hostname : null;
    if (apiHost && host === apiHost) return false;
    if (typeof window !== "undefined" && host === window.location.hostname) return false;
    return true;
  } catch {
    return true;
  }
}

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
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-[image:var(--hero-gradient)]", className)}>
      {showImage && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={shouldSkipOptimizer(src)}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-white/80 [&_svg]:size-1/3">
          <CategoryIcon name={null} />
        </div>
      )}
    </div>
  );
}
