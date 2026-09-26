import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main className="mx-auto flex min-h-[var(--app-height)] max-w-sm flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-page-title">{t("errors.notFoundTitle")}</h1>
      <p className="text-small text-muted-foreground">{t("errors.notFoundBody")}</p>
      <Link href="/" className="mt-4 text-small font-semibold text-accent">
        {t("nav.home")}
      </Link>
    </main>
  );
}
