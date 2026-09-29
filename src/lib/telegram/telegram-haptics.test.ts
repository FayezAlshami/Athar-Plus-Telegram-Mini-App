import { describe, expect, it, vi } from "vitest";
import { createHapticControls, hapticsAllowed } from "./telegram-haptics";

function stubMotionPreference(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }),
  });
}

describe("telegram haptics", () => {
  it("is silent when the user prefers reduced motion", () => {
    stubMotionPreference(true);
    const host = { impact: vi.fn(), notify: vi.fn(), selection: vi.fn() };
    const haptics = createHapticControls(host);
    haptics.impact("light");
    haptics.notify("success");
    haptics.selection();
    expect(hapticsAllowed()).toBe(false);
    expect(host.impact).not.toHaveBeenCalled();
    expect(host.notify).not.toHaveBeenCalled();
    expect(host.selection).not.toHaveBeenCalled();
  });

  it("forwards premium feedback when motion is allowed", () => {
    stubMotionPreference(false);
    const host = { impact: vi.fn(), notify: vi.fn(), selection: vi.fn() };
    const haptics = createHapticControls(host);
    haptics.notify("error");
    expect(host.notify).toHaveBeenCalledWith("error");
  });

  it("no-ops when Telegram haptics are unavailable", () => {
    stubMotionPreference(false);
    const haptics = createHapticControls(null);
    expect(() => haptics.impact("soft")).not.toThrow();
  });
});
