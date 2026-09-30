"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ArrowsOut, X } from "@phosphor-icons/react";
import { duration, spring } from "@/lib/animation/tokens";
import { CategoryIcon } from "@/features/categories/category-icon";
import { canOptimizeImage } from "@/lib/images/optimizable";
import { useSuppressVerticalSwipes } from "@/lib/telegram/hooks";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { cn } from "@/lib/cn";

/** Product visual with a branded fallback when the image fails or is missing. */
export function ProductImage({
  src,
  alt,
  className,
  sizes,
  priority,
  expandable = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  expandable?: boolean;
}) {
  const t = useTranslations("product");
  const telegram = useTelegramState();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // The viewer mounts on first open (client-only) and then stays for its exit animation.
  const [viewerMounted, setViewerMounted] = useState(false);
  const requestedFullscreen = useRef(false);
  const showImage = Boolean(src) && failedSrc !== src;
  useSuppressVerticalSwipes(open);

  const closeViewer = () => {
    setOpen(false);
    if (requestedFullscreen.current && telegram.status === "ready") {
      telegram.adapter.exitFullscreen();
      requestedFullscreen.current = false;
    }
  };

  const openViewer = () => {
    if (!expandable || !showImage) return;
    if (telegram.status === "ready" && !telegram.adapter.isFullscreen()) {
      telegram.adapter.requestFullscreen();
      requestedFullscreen.current = true;
    }
    setViewerMounted(true);
    setOpen(true);
  };

  return (
    <div className={cn("relative overflow-hidden bg-[image:var(--hero-gradient)]", className)}>
      {expandable && showImage && (
        <button type="button" className="absolute inset-0 z-10" aria-label={alt} onClick={openViewer} />
      )}
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
      {expandable && showImage && loadedSrc === src && (
        <span aria-hidden className="pointer-events-none absolute bottom-3 end-3 flex size-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
          <ArrowsOut className="size-4" weight="bold" />
        </span>
      )}
      {viewerMounted && src && <ImageViewer open={open} src={src} alt={alt} closeLabel={t("closeImage")} onClose={closeViewer} />}
    </div>
  );
}

/**
 * Full-screen image viewer. Portaled to <body> so page transforms and
 * overflow clipping can't trap it; closes on backdrop tap, the X, or Escape.
 */
function ImageViewer({ open, src, alt, closeLabel, onClose }: { open: boolean; src: string; alt: string; closeLabel: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 px-4 pt-[calc(var(--safe-top)+64px)] pb-[calc(var(--safe-bottom)+24px)] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.normal }}
          onClick={onClose}
        >
          <button
            ref={closeRef}
            type="button"
            className="absolute end-4 top-[calc(var(--safe-top)+12px)] flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors active:bg-white/25"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X className="size-5" weight="bold" />
          </button>
          <motion.img
            src={src}
            alt={alt}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={spring.entrance}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
