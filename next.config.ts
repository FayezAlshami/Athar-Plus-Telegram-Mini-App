import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

type RemotePattern = { protocol: "http" | "https"; hostname: string; pathname: string };

/** The image optimizer only proxies our own origins; any other host renders unoptimized. */
function trustedImageOrigin(value: string | undefined): RemotePattern | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const protocol = url.protocol.replace(":", "");
    if (protocol !== "http" && protocol !== "https") return null;
    return { protocol, hostname: url.hostname, pathname: "/**" };
  } catch {
    return null;
  }
}

const remotePatterns = [process.env.NEXT_PUBLIC_API_URL, process.env.NEXT_PUBLIC_APP_URL]
  .map(trustedImageOrigin)
  .filter((pattern): pattern is RemotePattern => pattern !== null);

/**
 * The Mini App runs in Telegram's webviews and, on Telegram Web, inside an
 * iframe on web.telegram.org — so framing is limited to Telegram, not denied.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
  },
  headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
