"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { Category } from "@/entities/category/types";
import { Card } from "@/components/ui/card";
import { fadeUp } from "@/lib/animation/variants";
import { canOptimizeImage } from "@/lib/images/optimizable";
import { usePrefetchCategory } from "@/features/catalog/use-prefetch-catalog";
import { cn } from "@/lib/cn";
import { CategoryIcon } from "./category-icon";

function CategoryPhoto({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={!canOptimizeImage(src)}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function tint(color: string | null): CSSProperties | undefined {
  if (!color) return undefined;
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}

export function CategoryCard({
  category,
  compact = false,
  featured = false,
}: {
  category: Category;
  compact?: boolean;
  featured?: boolean;
}) {
  const t = useTranslations("categories");
  const { ref: prefetchRef, onMouseEnter: prefetchOnHover, onTouchStart: prefetchOnTouch } = usePrefetchCategory(category.slug);
  const href = `/categories/${encodeURIComponent(category.slug)}`;
  const count = category.products_count !== undefined ? t("servicesCount", { count: category.products_count }) : null;

  if (compact) {
    return (
      <motion.div variants={fadeUp} className="w-[80px] shrink-0 snap-start" ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
        <Card href={href} className="flex flex-col items-center gap-2 border-none bg-transparent !shadow-none">
          <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface text-accent shadow-sm [&_svg]:size-7" style={category.image_url ? undefined : tint(category.accent_color)}>
            {category.image_url ? (
              <CategoryPhoto src={category.image_url} alt="" sizes="64px" />
            ) : (
              <CategoryIcon name={category.icon} />
            )}
          </span>
          <span dir="auto" className="line-clamp-2 text-center text-caption leading-tight text-foreground">{category.name}</span>
        </Card>
      </motion.div>
    );
  }

  if (category.image_url) {
    return (
      <motion.div variants={fadeUp} className={cn(featured && "col-span-2")} ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
        <Card href={href} className="relative block overflow-hidden">
          <span className={cn("relative block w-full bg-[image:var(--hero-gradient)]", featured ? "aspect-[2/1]" : "aspect-[4/5]")}>
            <CategoryPhoto src={category.image_url} alt={category.name} sizes={featured ? "(max-width: 640px) 100vw, 420px" : "180px"} />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3 text-white">
              <span dir="auto" className="line-clamp-2 text-card-title">{category.name}</span>
              {count && <span className="text-caption text-white/80">{count}</span>}
            </span>
          </span>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} ref={prefetchRef} onMouseEnter={prefetchOnHover} onTouchStart={prefetchOnTouch}>
      <Card href={href} className="relative flex h-full flex-col gap-4 overflow-hidden p-4">
        <span aria-hidden className="pointer-events-none absolute -end-6 -top-6 size-20 rounded-full" style={tint(category.accent_color) ?? { background: "var(--accent-soft)" }} />
        <span className="relative flex size-12 items-center justify-center rounded-md text-accent [&_svg]:size-6" style={tint(category.accent_color) ?? { background: "var(--accent-soft)" }}>
          <CategoryIcon name={category.icon} />
        </span>
        <span className="relative">
          <span dir="auto" className="line-clamp-2 block text-card-title">{category.name}</span>
          {count && <span className="text-caption text-muted-foreground">{count}</span>}
        </span>
      </Card>
    </motion.div>
  );
}
