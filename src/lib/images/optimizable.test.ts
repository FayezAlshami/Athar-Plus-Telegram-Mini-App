import { describe, expect, it, vi } from "vitest";

describe("canOptimizeImage", () => {
  it("only proxies relative paths and our own origins", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.athar.test");
    vi.resetModules();
    const { canOptimizeImage } = await import("./optimizable");

    expect(canOptimizeImage("/uploads/a.png")).toBe(true);
    expect(canOptimizeImage("https://api.athar.test/storage/a.png")).toBe(true);
    expect(canOptimizeImage("https://cdn.example.com/a.png")).toBe(false);
    expect(canOptimizeImage("//evil.example.com/a.png")).toBe(false);
    expect(canOptimizeImage("not a url")).toBe(false);

    vi.unstubAllEnvs();
  });
});
