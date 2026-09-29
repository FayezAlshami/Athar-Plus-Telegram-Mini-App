import { describe, expect, it } from "vitest";
import { normalizeColorScheme } from "./telegram-theme";

describe("telegram theme mapping", () => {
  it("maps Telegram colorScheme to light or dark without inventing a brand palette", () => {
    expect(normalizeColorScheme("dark")).toBe("dark");
    expect(normalizeColorScheme("light")).toBe("light");
    expect(normalizeColorScheme("unknown")).toBe("light");
  });
});
