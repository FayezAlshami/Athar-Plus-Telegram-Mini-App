import type { ComponentType } from "react";
import { Category, Home, Profile, Receipt21, Wallet3 } from "iconsax-react";

export type NavIconComponent = ComponentType<{
  size?: string | number;
  variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
  color?: string;
  className?: string;
}>;

export interface PrimaryDestination {
  href: string;
  labelKey: "home" | "explore" | "orders" | "wallet" | "profile";
  icon: NavIconComponent;
}

export const PRIMARY_DESTINATIONS: PrimaryDestination[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/categories", labelKey: "explore", icon: Category },
  { href: "/orders", labelKey: "orders", icon: Receipt21 },
  { href: "/wallet", labelKey: "wallet", icon: Wallet3 },
  { href: "/profile", labelKey: "profile", icon: Profile },
];

export function isNavDestinationActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function activeNavIndex(pathname: string): number {
  return PRIMARY_DESTINATIONS.findIndex((destination) => isNavDestinationActive(pathname, destination.href));
}

/** The sliding pill is also a child of the list, so tab index must ignore it. */
export function navTabElement(list: HTMLElement, activeIndex: number): HTMLElement | null {
  if (activeIndex < 0) return null;
  const item = list.querySelectorAll(":scope > li").item(activeIndex);
  return item instanceof HTMLElement ? item : null;
}

export function isPrimaryDestination(pathname: string): boolean {
  return activeNavIndex(pathname) >= 0;
}
