"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { useSuppressVerticalSwipes } from "@/lib/telegram/hooks";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Accessible, draggable sheet (vaul/Radix) styled with Athar surfaces and safe areas. */
export function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  useSuppressVerticalSwipes(open);
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-[var(--content-max-width)] flex-col rounded-t-xl border border-border bg-surface-elevated ps-[max(0px,var(--safe-left))] pe-[max(0px,var(--safe-right))] pb-[calc(var(--safe-bottom)+16px)] shadow-lg outline-none">
          <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-strong" />
          <div className="shrink-0 px-5 pt-4 pb-2">
            <Drawer.Title className="text-section-title">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-small text-muted-foreground">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          {/* min-h-0 lets the body shrink and scroll inside the 88dvh cap instead of overflowing it. */}
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
