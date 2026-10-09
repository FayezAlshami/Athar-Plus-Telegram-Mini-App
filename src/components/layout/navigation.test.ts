import { describe, expect, it } from "vitest";
import { activeNavIndex, isNavDestinationActive, isPrimaryDestination } from "./navigation";

describe("navigation", () => {
  it("marks only the home tab active on the root path", () => {
    expect(isNavDestinationActive("/", "/")).toBe(true);
    expect(isNavDestinationActive("/", "/profile")).toBe(false);
    expect(activeNavIndex("/")).toBe(0);
  });

  it("keeps secondary profile screens off the primary tab bar", () => {
    expect(isNavDestinationActive("/faq", "/profile")).toBe(false);
    expect(activeNavIndex("/faq")).toBe(-1);
    expect(isPrimaryDestination("/faq")).toBe(false);
  });
});
