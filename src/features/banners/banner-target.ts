import type { Banner } from "@/entities/banner/types";

/** Resolves a banner destination to an in-app route or an external URL. */
export function bannerDestination(banner: Banner): { kind: "internal" | "external"; href: string } | null {
  const target = banner.target;
  if (!target) return null;

  switch (target.type) {
    case "product":
      return target.value ? { kind: "internal", href: `/products/${target.value}` } : null;
    case "category":
      return target.value ? { kind: "internal", href: `/categories/${target.value}` } : null;
    case "campaign":
      return target.value ? { kind: "internal", href: `/campaigns/${target.value}` } : null;
    case "membership":
      return { kind: "internal", href: "/membership" };
    case "url":
      return target.value?.startsWith("https://") ? { kind: "external", href: target.value } : null;
  }
}
