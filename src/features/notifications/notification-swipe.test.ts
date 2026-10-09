import { describe, expect, it } from "vitest";
import { shouldDismissNotification } from "./notification-swipe";

describe("shouldDismissNotification", () => {
  it("dismisses a rightward swipe in Arabic and a leftward swipe in English", () => {
    expect(shouldDismissNotification(80, "rtl")).toBe(true);
    expect(shouldDismissNotification(-80, "rtl")).toBe(false);
    expect(shouldDismissNotification(-80, "ltr")).toBe(true);
    expect(shouldDismissNotification(80, "ltr")).toBe(false);
  });

  it("ignores a short drag", () => {
    expect(shouldDismissNotification(20, "rtl")).toBe(false);
    expect(shouldDismissNotification(-20, "ltr")).toBe(false);
  });
});
