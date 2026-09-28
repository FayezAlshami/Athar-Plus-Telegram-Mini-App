import { describe, expect, it } from "vitest";
import { decodeParam } from "./decode-param";

describe("decodeParam", () => {
  it("decodes valid segments and tolerates malformed ones", () => {
    expect(decodeParam("%D9%83%D8%A7%D9%86%D9%81%D8%A7")).toBe("كانفا");
    expect(decodeParam("%E0%A4%A")).toBe("%E0%A4%A");
  });
});
