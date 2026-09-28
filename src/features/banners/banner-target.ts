import type { Banner } from "@/entities/banner/types";

/** Admin-entered identifiers become one encoded path segment, never a path of their own. */
function segment(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? encodeURIComponent(trimmed) : null;
}

function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Resolves a banner destination to an in-app route or an external URL. */
export function bannerDestination(banner: Banner): { kind: "internal" | "external"; href: string } | null {
  const target = banner.target;
  if (!target) return null;

  switch (target.type) {
    case "product": {
      const value = segment(target.value);
      return value ? { kind: "internal", href: `/products/${value}` } : null;
    }
    case "category": {
      const value = segment(target.value);
      return value ? { kind: "internal", href: `/categories/${value}` } : null;
    }
    case "campaign": {
      const value = segment(target.value);
      return value ? { kind: "internal", href: `/campaigns/${value}` } : null;
    }
    case "membership":
      return { kind: "internal", href: "/membership" };
    case "url": {
      const href = safeExternalUrl(target.value);
      return href ? { kind: "external", href } : null;
    }
    default:
      return null;
  }
}
