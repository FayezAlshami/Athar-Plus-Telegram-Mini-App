import { describe, expect, it } from "vitest";
import { cacheDecision } from "./cache-policy";

describe("cacheDecision", () => {
  it("caches public catalog reads and ignores the bearer token", () => {
    expect(cacheDecision({ method: "GET", pathname: "/api/v1/categories", hasAuthorization: true })).toBe("catalog");
    expect(cacheDecision({ method: "GET", pathname: "/api/v1/products/12", hasAuthorization: true })).toBe("catalog");
    expect(cacheDecision({ method: "GET", pathname: "/api/v1/home", hasAuthorization: true })).toBe("catalog");
    expect(cacheDecision({ method: "GET", pathname: "/api/v1/search", hasAuthorization: true })).toBe("catalog");
  });

  it("never caches private responses, writes, or the admin surface", () => {
    for (const pathname of ["/api/v1/profile", "/api/v1/wallet", "/api/v1/orders", "/api/v1/notifications", "/api/v1/me", "/api/v1/favorites"]) {
      expect(cacheDecision({ method: "GET", pathname, hasAuthorization: true })).toBe("none");
      expect(cacheDecision({ method: "GET", pathname, hasAuthorization: false })).toBe("none");
    }
    expect(cacheDecision({ method: "POST", pathname: "/api/v1/orders", hasAuthorization: true })).toBe("none");
    expect(cacheDecision({ method: "GET", pathname: "/api/v1/admin/orders", hasAuthorization: false })).toBe("none");
    expect(cacheDecision({ method: "GET", pathname: "/admin/orders", hasAuthorization: false })).toBe("none");
  });

  it("caches images and static chunks only", () => {
    expect(cacheDecision({ method: "GET", pathname: "/photo.jpg", hasAuthorization: false, destination: "image" })).toBe("image");
    expect(cacheDecision({ method: "GET", pathname: "/_next/static/chunks/app.js", hasAuthorization: false })).toBe("static");
  });
});
