import { describe, expect, it } from "vitest";
import { routeForStartParam } from "./start-param";

describe("routeForStartParam", () => {
  it("maps supported deep links", () => {
    expect(routeForStartParam("product_123")).toBe("/products/123");
    expect(routeForStartParam("campaign_summer_sale")).toBe("/campaigns/summer-sale");
    expect(routeForStartParam("membership")).toBe("/membership");
  });

  it("rejects unknown or unsafe values", () => {
    expect(routeForStartParam("admin_1")).toBeNull();
    expect(routeForStartParam("product_../../x")).toBeNull();
    expect(routeForStartParam(null)).toBeNull();
  });
});
