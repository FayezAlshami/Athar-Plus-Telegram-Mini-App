import { describe, expect, it } from "vitest";
import { miniAppDeepLink, parseStartParam, productStartParam, routeForStartParam } from "./start-param";

describe("routeForStartParam", () => {
  it("maps supported deep links", () => {
    expect(routeForStartParam("product_123")).toBe("/products/123");
    expect(routeForStartParam("campaign_summer_sale")).toBe("/campaigns/summer-sale");
    expect(routeForStartParam("membership")).toBe("/membership");
  });

  it("keeps the product route when a referral code is attached", () => {
    expect(parseStartParam("product_12_r_AB12CD34")).toEqual({
      route: "/products/12",
      referralCode: "AB12CD34",
    });
    expect(productStartParam(12, "AB12CD34")).toBe("product_12_r_AB12CD34");
    expect(miniAppDeepLink("@AtharPlusTestBot", "product_12")).toBe("https://t.me/AtharPlusTestBot?startapp=product_12");
  });

  it("rejects unknown or unsafe values", () => {
    expect(routeForStartParam("admin_1")).toBeNull();
    expect(routeForStartParam("product_../../x")).toBeNull();
    expect(routeForStartParam(null)).toBeNull();
  });
});
