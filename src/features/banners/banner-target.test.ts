import { describe, expect, it } from "vitest";
import type { Banner } from "@/entities/banner/types";
import { bannerDestination } from "./banner-target";

const banner = (target: Banner["target"]): Banner => ({
  id: 1, title: "T", subtitle: null, cta_label: null, image_url: null, theme: "navy", target,
});

describe("bannerDestination", () => {
  it("keeps admin values inside a single path segment", () => {
    expect(bannerDestination(banner({ type: "category", value: "../wallet" }))?.href).toBe("/categories/..%2Fwallet");
    expect(bannerDestination(banner({ type: "product", value: "12" }))?.href).toBe("/products/12");
  });

  it("only opens https links externally", () => {
    expect(bannerDestination(banner({ type: "url", value: "https://t.me/athar" }))).toEqual({ kind: "external", href: "https://t.me/athar" });
    expect(bannerDestination(banner({ type: "url", value: "javascript:alert(1)" }))).toBeNull();
    expect(bannerDestination(banner({ type: "url", value: "http://example.com" }))).toBeNull();
  });
});
