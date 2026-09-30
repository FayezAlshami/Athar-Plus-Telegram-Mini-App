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

export function isPrimaryDestination(pathname: string): boolean {
  return PRIMARY_DESTINATIONS.some((destination) => destination.href === pathname);
}
