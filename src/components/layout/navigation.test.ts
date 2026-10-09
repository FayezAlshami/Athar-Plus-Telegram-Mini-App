import { describe, expect, it } from "vitest";
import { PRIMARY_DESTINATIONS, activeNavIndex, isNavDestinationActive, isPrimaryDestination, navTabElement } from "./navigation";

describe("navigation", () => {
  it("marks only the home tab active on the root path", () => {
    expect(isNavDestinationActive("/", "/")).toBe(true);
    expect(isNavDestinationActive("/", "/profile")).toBe(false);
    expect(activeNavIndex("/")).toBe(0);
  });

  it("activates exactly one primary tab for each route, including nested screens", () => {
    const cases = [
      ["/", "/"],
      ["/categories", "/categories"],
      ["/categories/games", "/categories"],
      ["/orders", "/orders"],
      ["/orders/42", "/orders"],
      ["/wallet", "/wallet"],
      ["/wallet/deposit", "/wallet"],
      ["/profile", "/profile"],
    ] as const;

    for (const [pathname, href] of cases) {
      const active = PRIMARY_DESTINATIONS.filter((destination) => isNavDestinationActive(pathname, destination.href));
      expect(active.map((destination) => destination.href)).toEqual([href]);
      expect(activeNavIndex(pathname)).toBe(PRIMARY_DESTINATIONS.findIndex((destination) => destination.href === href));
    }
  });

  it("keeps secondary profile screens off the primary tab bar", () => {
    expect(isNavDestinationActive("/faq", "/profile")).toBe(false);
    expect(activeNavIndex("/faq")).toBe(-1);
    expect(isPrimaryDestination("/faq")).toBe(false);
  });

  it("resolves the tab by list item index and ignores the sliding pill", () => {
    const list = document.createElement("ul");
    list.append(document.createElement("span"));
    for (const destination of PRIMARY_DESTINATIONS) {
      const item = document.createElement("li");
      item.dataset.href = destination.href;
      list.append(item);
    }

    expect(navTabElement(list, 0)?.dataset.href).toBe("/");
    expect(navTabElement(list, 4)?.dataset.href).toBe("/profile");
    const shifted = list.children.item(4);
    expect(shifted instanceof HTMLElement ? shifted.dataset.href : undefined).toBe("/wallet");
  });
});
