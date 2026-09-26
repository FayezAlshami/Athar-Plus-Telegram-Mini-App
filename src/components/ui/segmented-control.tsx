"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/animation/tokens";
import { useHaptics } from "@/lib/telegram/hooks";
import { cn } from "@/lib/cn";

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}

/** Tabs-like selector with a shared animated indicator. */
export function SegmentedControl<T extends string>({ value, onChange, options, label }: SegmentedControlProps<T>) {
  const layoutId = useId();
  const haptics = useHaptics();

  return (
    <div role="tablist" aria-label={label} className="flex rounded-md bg-surface-sunken p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={cn(
              "relative h-10 flex-1 rounded-sm text-small font-medium transition-colors duration-200",
              selected ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selected && (
              <motion.span layoutId={layoutId} transition={spring.interactive} className="absolute inset-0 rounded-sm bg-surface-elevated shadow-sm" />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
