import { House, Receipt, SquaresFour, UserCircle, Wallet, type Icon } from "@phosphor-icons/react";

export interface PrimaryDestination {
  href: string;
  labelKey: "home" | "explore" | "orders" | "wallet" | "profile";
  icon: Icon;
}

export const PRIMARY_DESTINATIONS: PrimaryDestination[] = [
  { href: "/", labelKey: "home", icon: House },
  { href: "/categories", labelKey: "explore", icon: SquaresFour },
  { href: "/orders", labelKey: "orders", icon: Receipt },
  { href: "/wallet", labelKey: "wallet", icon: Wallet },
  { href: "/profile", labelKey: "profile", icon: UserCircle },
];

export function isPrimaryDestination(pathname: string): boolean {
  return PRIMARY_DESTINATIONS.some((destination) => destination.href === pathname);
}
