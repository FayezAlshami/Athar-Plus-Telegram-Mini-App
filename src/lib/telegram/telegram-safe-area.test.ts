import { describe, expect, it } from "vitest";
import { combineSafeAreaInsets, resolveSafeAreas, safeAreaCssVariables, ZERO_INSET } from "./telegram-safe-area";

describe("telegram safe areas", () => {
  it("adds device and content insets without hardcoded device padding", () => {
    const combined = combineSafeAreaInsets(
      { top: 24, bottom: 16, left: 0, right: 0 },
      { top: 48, bottom: 0, left: 8, right: 8 },
    );
    expect(combined).toEqual({ top: 72, bottom: 16, left: 8, right: 8 });
  });

  it("falls back to zero insets when Telegram omits them", () => {
    expect(resolveSafeAreas(null, undefined)).toEqual({
      device: ZERO_INSET,
      content: ZERO_INSET,
      combined: ZERO_INSET,
    });
  });

  it("exposes both Telegram inset families as CSS variables", () => {
    const css = safeAreaCssVariables(
      resolveSafeAreas({ top: 10, bottom: 20, left: 1, right: 2 }, { top: 5, bottom: 0, left: 0, right: 0 }),
      700,
    );
    expect(css["--safe-top"]).toContain("15px");
    expect(css["--safe-bottom"]).toContain("20px");
    expect(css["--tg-safe-area-inset-top"]).toBe("10px");
    expect(css["--tg-content-safe-area-inset-top"]).toBe("5px");
    expect(css["--app-height"]).toBe("700px");
  });
});
