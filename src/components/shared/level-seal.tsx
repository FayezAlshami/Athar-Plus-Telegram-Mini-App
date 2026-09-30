"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import type { MembershipLevelCode } from "@/entities/membership/types";
import { cn } from "@/lib/cn";

/** Star-rosette outline; the round stroke join softens every point into a scallop. */
function rosette(points: number, outer: number, inner: number, rotation = 0): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / points - Math.PI / 2 + rotation;
    coords.push(`${(12 + radius * Math.cos(angle)).toFixed(2)},${(12 + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${coords.join("L")}Z`;
}

const SEAL = {
  normal: {
    shape: rosette(8, 10.4, 8.9),
    stops: ["#b7c2d0", "#8494a8", "#5d6b7e"],
    edge: "#56647a",
    mark: "#ffffff",
  },
  essential: {
    shape: rosette(12, 10.6, 9.1),
    stops: ["#4fd1c5", "#178f89", "#0f4f63"],
    edge: "#0e5561",
    mark: "#ffffff",
  },
  plus: {
    shape: rosette(16, 10.9, 9.3),
    stops: ["#fbe7a6", "#d9a93f", "#8a5f17"],
    edge: "#7a5213",
    mark: "#3b2706",
  },
} as const;

const CHECK = "M7.9 12.3l2.7 2.7 5.5-5.6";

/**
 * Verification-style seal for a membership level. Each level has its own silhouette:
 * a soft 8-point slate stamp, a 12-point teal rosette, and a 16-point gold medal with a live shine.
 */
export function LevelSeal({
  level,
  size = 18,
  className,
  decorative = false,
}: {
  level: MembershipLevelCode;
  size?: number;
  className?: string;
  decorative?: boolean;
}) {
  const t = useTranslations("membership");
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const seal = SEAL[level];
  const fill = `seal-fill-${uid}`;
  const gloss = `seal-gloss-${uid}`;
  const clip = `seal-clip-${uid}`;
  const shine = `seal-shine-${uid}`;
  const label = t("verified", { level: t(`level.${level}`) });

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={cn("shrink-0 overflow-visible", level === "plus" && "drop-shadow-[0_1px_2px_rgba(138,95,23,0.45)]", className)}
    >
      {!decorative && <title>{label}</title>}
      <defs>
        <linearGradient id={fill} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={seal.stops[0]} />
          <stop offset="55%" stopColor={seal.stops[1]} />
          <stop offset="100%" stopColor={seal.stops[2]} />
        </linearGradient>
        <radialGradient id={gloss} cx="0.32" cy="0.22" r="0.55">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <path d={seal.shape} />
        </clipPath>
        {level === "plus" && (
          <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      <path d={seal.shape} fill={`url(#${fill})`} stroke={`url(#${fill})`} strokeWidth={1.7} strokeLinejoin="round" />
      <path d={seal.shape} fill="none" stroke={seal.edge} strokeOpacity={0.35} strokeWidth={0.5} strokeLinejoin="round" />

      <g clipPath={`url(#${clip})`}>
        <circle cx="12" cy="12" r="11" fill={`url(#${gloss})`} />
        {level === "plus" && (
          <rect x="-10" y="-4" width="7" height="32" fill={`url(#${shine})`} transform="rotate(20 12 12)">
            {!reduce && <animate attributeName="x" values="-10;30;30" keyTimes="0;0.35;1" dur="3.6s" repeatCount="indefinite" />}
          </rect>
        )}
      </g>

      {level !== "normal" && (
        <circle cx="12" cy="12" r="6.6" fill="none" stroke="#ffffff" strokeOpacity={level === "plus" ? 0.5 : 0.3} strokeWidth={0.55} />
      )}

      <path d={CHECK} fill="none" stroke={seal.mark} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />

      {level === "plus" && (
        <path d="M19.6 2.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z" fill="#fff6d6">
          {!reduce && <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" />}
        </path>
      )}
    </svg>
  );
}
