"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Accessible, draggable sheet (vaul/Radix) styled with Athar surfaces and safe areas. */
export function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-[var(--content-max-width)] flex-col rounded-t-xl border border-border bg-surface-elevated pb-[calc(var(--safe-bottom)+16px)] shadow-lg outline-none">
          <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-strong" />
          <div className="px-5 pt-4 pb-2">
            <Drawer.Title className="text-section-title">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-small text-muted-foreground">{description}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          <div className="overflow-y-auto px-5 pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
