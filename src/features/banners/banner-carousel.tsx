"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import type { Banner } from "@/entities/banner/types";
import { pressScale, spring } from "@/lib/animation/tokens";
import { useTelegramState } from "@/lib/telegram/telegram-provider";
import { cn } from "@/lib/cn";
import { bannerDestination } from "./banner-target";

const THEME_BACKGROUND: Record<Banner["theme"], string> = {
  navy: "bg-[image:var(--hero-gradient)] text-white",
  gold: "bg-[image:var(--plus-gradient)] text-on-plus",
  turquoise: "bg-accent text-accent-foreground",
};

function BannerSlide({ banner, index }: { banner: Banner; index: number }) {
  const router = useRouter();
  const telegram = useTelegramState();
  const destination = bannerDestination(banner);

  const open = () => {
    if (!destination) return;
    if (destination.kind === "internal") router.push(destination.href);
    else if (telegram.status === "ready") telegram.adapter.openLink(destination.href);
  };

  return (
    <motion.button
      type="button"
      onClick={open}
      disabled={!destination}
      whileTap={destination ? { scale: pressScale.card } : undefined}
      transition={spring.interactive}
      className={cn("relative flex h-40 w-full shrink-0 snap-center flex-col justify-end overflow-hidden rounded-xl p-5 text-start shadow-md", THEME_BACKGROUND[banner.theme])}
    >
      {banner.image_url && (
        <Image src={banner.image_url} alt="" fill sizes="(max-width: 640px) 100vw, 640px" priority={index === 0} className="object-cover opacity-90" />
      )}
      <div className="relative">
        <p className="font-display text-xl font-semibold leading-snug">{banner.title}</p>
        {banner.subtitle && <p className="mt-1 text-small opacity-80">{banner.subtitle}</p>}
        {banner.cta_label && destination && (
          <span className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold">
            {banner.cta_label}
            <ArrowRight className="size-4 rtl:-scale-x-100" weight="bold" />
          </span>
        )}
      </div>
    </motion.button>
  );
}

/** Native scroll-snap carousel — no scroll hijacking, momentum stays native. */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (banners.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div
        ref={trackRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none]"
      >
        {banners.map((banner, index) => <BannerSlide key={banner.id} banner={banner} index={index} />)}
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {banners.map((banner, index) => (
            <motion.span key={banner.id} animate={{ width: index === active ? 18 : 6 }} transition={spring.interactive} className={cn("h-1.5 rounded-full", index === active ? "bg-accent" : "bg-border-strong")} />
          ))}
        </div>
      )}
    </div>
  );
}
