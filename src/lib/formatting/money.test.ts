import { describe, expect, it } from "vitest";
import { formatMoney, parseMajorToMinor } from "./money";

describe("money formatting", () => {
  it("parses user input into minor units without float drift", () => {
    expect(parseMajorToMinor("12.5")).toBe(1250);
    expect(parseMajorToMinor("٣")).toBe(300);
    expect(parseMajorToMinor("0.07")).toBe(7);
    expect(parseMajorToMinor("1.234")).toBeNull();
    expect(parseMajorToMinor("abc")).toBeNull();
  });

  it("formats whole and fractional USD amounts", () => {
    expect(formatMoney(1500, "USD")).toBe("$15");
    expect(formatMoney(999, "USD")).toBe("$9.99");
  });
});
