import type { TelegramSafeAreaInset } from "./web-app";
import type { TelegramSafeAreas } from "./telegram.types";

export const ZERO_INSET: TelegramSafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 };

export function combineSafeAreaInsets(
  device: TelegramSafeAreaInset,
  content: TelegramSafeAreaInset,
): TelegramSafeAreaInset {
  return {
    top: device.top + content.top,
    bottom: device.bottom + content.bottom,
    left: device.left + content.left,
    right: device.right + content.right,
  };
}

export function resolveSafeAreas(
  device: TelegramSafeAreaInset | null | undefined,
  content: TelegramSafeAreaInset | null | undefined,
): TelegramSafeAreas {
  const nextDevice = device ?? ZERO_INSET;
  const nextContent = content ?? ZERO_INSET;
  return {
    device: nextDevice,
    content: nextContent,
    combined: combineSafeAreaInsets(nextDevice, nextContent),
  };
}

/** CSS custom properties consumed by layout, nav, sheets, and fixed CTAs. */
export function safeAreaCssVariables(
  areas: TelegramSafeAreas,
  viewportHeight: number | null,
): Record<string, string> {
  const { device, content, combined } = areas;
  return {
    "--safe-top": `max(env(safe-area-inset-top, 0px), ${combined.top}px)`,
    "--safe-bottom": `max(env(safe-area-inset-bottom, 0px), ${combined.bottom}px)`,
    "--safe-left": `max(env(safe-area-inset-left, 0px), ${combined.left}px)`,
    "--safe-right": `max(env(safe-area-inset-right, 0px), ${combined.right}px)`,
    "--safe-top-device": `${device.top}px`,
    "--safe-bottom-device": `${device.bottom}px`,
    "--content-safe-top": `${content.top}px`,
    "--content-safe-bottom": `${content.bottom}px`,
    "--tg-safe-area-inset-top": `${device.top}px`,
    "--tg-safe-area-inset-bottom": `${device.bottom}px`,
    "--tg-safe-area-inset-left": `${device.left}px`,
    "--tg-safe-area-inset-right": `${device.right}px`,
    "--tg-content-safe-area-inset-top": `${content.top}px`,
    "--tg-content-safe-area-inset-bottom": `${content.bottom}px`,
    "--tg-content-safe-area-inset-left": `${content.left}px`,
    "--tg-content-safe-area-inset-right": `${content.right}px`,
    "--app-height": viewportHeight ? `${viewportHeight}px` : "100dvh",
  };
}

export function applyCssVariables(variables: Record<string, string>): void {
  const root = document.documentElement.style;
  for (const [name, value] of Object.entries(variables)) {
    root.setProperty(name, value);
  }
}
