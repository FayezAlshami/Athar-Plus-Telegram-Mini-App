"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import type { Banner } from "@/entities/banner/types";
import { pressScale, spring } from "@/lib/animation/tokens";
import { canOptimizeImage } from "@/lib/images/optimizable";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { cn } from "@/lib/cn";
import { bannerDestination } from "./banner-target";

const THEME_BACKGROUND: Record<Banner["theme"], string> = {
  navy: "bg-[image:var(--hero-gradient)] text-white",
  gold: "bg-[image:var(--plus-gradient)] text-on-plus",
  turquoise: "bg-accent text-accent-foreground",
};

const AUTOPLAY_MS = 6000;

function BannerSlide({ banner, index }: { banner: Banner; index: number }) {
  const router = useRouter();
  const telegram = useTelegramState();
  const destination = bannerDestination(banner);

  const open = () => {
    if (!destination) return;
    if (destination.kind === "internal") router.push(destination.href);
    else if (telegram.status === "ready") telegram.adapter.openLink(destination.href);
    else window.open(destination.href, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.button
      type="button"
      onClick={open}
      disabled={!destination}
      whileTap={destination ? { scale: pressScale.card } : undefined}
      transition={spring.interactive}
      aria-roledescription="slide"
      className={cn(
        "relative flex aspect-[2/1] max-h-52 min-h-40 w-full shrink-0 snap-center snap-always flex-col justify-end overflow-hidden rounded-xl p-5 text-start shadow-md disabled:cursor-default",
        THEME_BACKGROUND[banner.theme],
      )}
    >
      {banner.image_url && (
        <>
          <Image
            src={banner.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            priority={index === 0}
            unoptimized={!canOptimizeImage(banner.image_url)}
            className="object-cover"
          />
          {/* Keeps the copy legible over any artwork. */}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        </>
      )}
      <div className={cn("relative", banner.image_url && "text-white")}>
        <p dir="auto" className="font-display text-xl font-semibold leading-snug">{banner.title}</p>
        {banner.subtitle && <p dir="auto" className="mt-1 line-clamp-2 text-small opacity-85">{banner.subtitle}</p>}
        {banner.cta_label && destination && (
          <span className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-small font-semibold backdrop-blur-sm">
            {banner.cta_label}
            <ArrowRight className="size-4 rtl:-scale-x-100" weight="bold" />
          </span>
        )}
      </div>
    </motion.button>
  );
}

/** Native scroll-snap carousel — no scroll hijacking, momentum stays native. Gently advances until touched. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const [first, second] = Array.from(track?.children ?? []) as HTMLElement[];
    if (!track || !first) return;
    const step = second ? Math.abs(second.offsetLeft - first.offsetLeft) : track.clientWidth;
    // RTL scroll offsets run from 0 towards negative values.
    const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
    track.scrollTo({ left: sign * index * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (interacted || banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      scrollToIndex((activeRef.current + 1) % banners.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [banners.length, interacted, scrollToIndex]);

  if (banners.length === 0) return null;

  return (
    <section aria-roledescription="carousel" className="flex flex-col gap-2.5">
      <div
        ref={trackRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          const index = Math.min(Math.round(Math.abs(el.scrollLeft) / Math.max(el.clientWidth, 1)), banners.length - 1);
          activeRef.current = index;
          setActive(index);
        }}
        onPointerDown={() => setInteracted(true)}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, index) => <BannerSlide key={banner.id} banner={banner} index={index} />)}
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {banners.map((banner, index) => (
            <motion.span
              key={banner.id}
              animate={{ width: index === active ? 18 : 6 }}
              transition={spring.interactive}
              className={cn("h-1.5 rounded-full transition-colors", index === active ? "bg-accent" : "bg-border-strong")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
