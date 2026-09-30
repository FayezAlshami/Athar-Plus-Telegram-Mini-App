"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Crown, Lightning, Sparkle, Tag } from "@phosphor-icons/react";
import { LevelSeal } from "@/components/shared/level-seal";
import { ButterflyMark } from "@/components/shared/butterfly";

const SPARKLES = [
  { top: "18%", insetInlineEnd: "34%", size: 10, delay: 0 },
  { top: "68%", insetInlineEnd: "8%", size: 8, delay: 0.9 },
  { top: "12%", insetInlineEnd: "10%", size: 7, delay: 1.7 },
];

/** Home-page invitation to Plus: deep ink and gold, a floating medal, and three perks at a glance. */
export function PlusPromo() {
  const t = useTranslations("home");
  const reduce = useReducedMotion();
  const perks = [
    { icon: Tag, label: t("plusPerks.a") },
    { icon: Lightning, label: t("plusPerks.b") },
    { icon: Sparkle, label: t("plusPerks.c") },
  ];

  return (
    <Link
      href="/membership"
      className="group relative block overflow-hidden rounded-2xl p-5 text-[#f6ecd2] shadow-[0_18px_40px_-18px_rgba(90,62,15,0.7)] transition-transform duration-150 active:scale-[0.99]"
      style={{
        background:
          "radial-gradient(120% 90% at 0% 0%, rgba(233,193,110,0.38) 0%, rgba(233,193,110,0) 55%), linear-gradient(135deg, #14100a 0%, #2a1f0d 48%, #5b4216 100%)",
      }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#e9c16e]/25" />
      <ButterflyMark className="pointer-events-none absolute -bottom-10 start-[-2.5rem] size-40 text-[#e9c16e]/[0.06]" />

      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent"
          initial={{ x: "-160%" }}
          animate={{ x: "520%" }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 4.5 }}
        />
      )}

      <div aria-hidden className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -m-4 rounded-full bg-[#e9c16e]/30 blur-2xl" />
        <motion.div
          className="relative"
          animate={reduce ? undefined : { y: [0, -5, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <LevelSeal level="plus" size={84} decorative />
        </motion.div>
      </div>
      {SPARKLES.map((sparkle, index) => (
        <motion.span
          key={index}
          aria-hidden
          className="pointer-events-none absolute text-[#fbe7a6]"
          style={{ top: sparkle.top, insetInlineEnd: sparkle.insetInlineEnd }}
          animate={reduce ? undefined : { opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: sparkle.delay, ease: "easeInOut" }}
        >
          <Sparkle weight="fill" style={{ width: sparkle.size, height: sparkle.size }} />
        </motion.span>
      ))}

      <div className="relative flex max-w-[68%] flex-col items-start gap-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e9c16e]/15 px-2.5 py-1 text-[11px] font-semibold text-[#f1d48f] ring-1 ring-inset ring-[#e9c16e]/30">
          <Crown weight="fill" className="size-3.5" />
          {t("plusEyebrow")}
        </span>
        <h2 className="bg-gradient-to-l from-[#fbe7a6] via-[#e9c16e] to-[#fbe7a6] bg-clip-text font-display text-[1.45rem] font-bold leading-tight text-transparent">
          {t("plusTitle")}
        </h2>
        <p className="text-small leading-relaxed text-[#f6ecd2]/80">{t("plusBody")}</p>
        <ul className="flex flex-wrap gap-1.5">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-1 text-[11px] font-medium text-[#f6ecd2]/90">
              <Icon weight="fill" className="size-3 text-[#e9c16e]" />
              {label}
            </li>
          ))}
        </ul>
        <span className="mt-1 inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-l from-[#f1d48f] to-[#d9a93f] px-4 text-small font-bold text-[#2a1b04] shadow-[0_6px_16px_-6px_rgba(217,169,63,0.8)] transition-transform group-active:scale-95">
          {t("plusCta")}
          <ArrowRight className="size-4 rtl:-scale-x-100" weight="bold" />
        </span>
      </div>
    </Link>
  );
}
