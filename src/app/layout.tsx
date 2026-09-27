import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource-variable/readex-pro";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-providers";
import { directionOf } from "@/lib/i18n/config";
import { THEME_COOKIE } from "@/lib/constants/storage-keys";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return { title: t("name"), description: t("tagline"), robots: { index: false } };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070d1b" },
  ],
};

/** Applies the `dark` class before first paint. An explicit cookie wins over Telegram. */
const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement;var m=document.cookie.match(/(?:^|; )athar-theme=([^;]*)/);var theme=m?decodeURIComponent(m[1]):null;if(theme!=='dark'&&theme!=='light'){var w=window.Telegram&&window.Telegram.WebApp;var s=w&&w.initData?w.colorScheme:null;theme=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}d.classList.toggle('dark',theme==='dark');})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const storedTheme = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : undefined;

  return (
    <html lang={locale} dir={directionOf(locale === "en" ? "en" : "ar")} className={theme === "dark" ? "dark" : undefined} suppressHydrationWarning>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
