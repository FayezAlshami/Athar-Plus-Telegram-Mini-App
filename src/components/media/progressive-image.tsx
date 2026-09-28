"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Lazy image that appears blurred, then sharpens.
 * The wash behind it is visible immediately, before the file arrives.
 */
export function ProgressiveImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [sharp, setSharp] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      onLoad={() => setSharp(true)}
      className={cn(
        "object-cover transition-[filter,transform,opacity] duration-700 ease-out",
        sharp ? "scale-100 opacity-100 blur-0" : "scale-110 opacity-80 blur-xl",
        className,
      )}
    />
  );
}
