import { describe, expect, it } from "vitest";
import { seg } from "./endpoints";

describe("seg", () => {
  it("never lets a route value escape its path segment", () => {
    expect(seg("../wallet")).toBe("..%2Fwallet");
    expect(seg("..")).toBe("-");
    expect(seg(".")).toBe("-");
    expect(seg("a?b#c")).toBe("a%3Fb%23c");
    expect(seg(42)).toBe("42");
  });
});
