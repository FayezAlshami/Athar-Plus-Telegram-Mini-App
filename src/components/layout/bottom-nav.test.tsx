import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PRIMARY_DESTINATIONS } from "./navigation";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ prefetch: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({}),
}));

vi.mock("@/lib/telegram/hooks", () => ({
  useHaptics: () => ({ selection: vi.fn() }),
}));

vi.mock("@/features/catalog/prefetch-primary-routes", () => ({
  prefetchPrimaryRoute: vi.fn(),
}));

vi.mock("motion/react", async () => {
  const React = await import("react");
  return {
    useReducedMotion: () => true,
    motion: {
      span: ({ animate, children, ...rest }: { animate?: { left?: number; width?: number }; children?: React.ReactNode }) =>
        React.createElement(
          "span",
          {
            ...rest,
            style: {
              ...(typeof animate?.left === "number" ? { left: `${animate.left}px`, width: `${animate.width}px` } : {}),
            },
          },
          children,
        ),
    },
  };
});

const TAB_WIDTH = 80;

function installLayout() {
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get() {
      if (this.tagName !== "LI") return 0;
      const href = this.querySelector("a")?.getAttribute("href") ?? "";
      const index = PRIMARY_DESTINATIONS.findIndex((destination) => destination.href === href);
      return Math.max(index, 0) * TAB_WIDTH;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return this.tagName === "LI" ? 72 : 0;
    },
  });
}

describe("BottomNav", () => {
  beforeEach(() => {
    pathname = "/";
    installLayout();
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
  });

  it("places the indicator on the tab for the current route", async () => {
    const { BottomNav } = await import("./bottom-nav");
    const { rerender } = render(<BottomNav />);

    for (const [index, destination] of PRIMARY_DESTINATIONS.entries()) {
      pathname = destination.href;
      rerender(<BottomNav />);

      const current = screen.getAllByRole("link").filter((link) => link.getAttribute("aria-current") === "page");
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveAttribute("href", destination.href);

      const pill = document.querySelector("nav span[aria-hidden='true']");
      expect(pill).toHaveStyle({ left: `${index * TAB_WIDTH + 5}px` });
    }
  });
});
