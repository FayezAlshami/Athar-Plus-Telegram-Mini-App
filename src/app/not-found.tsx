import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main className="mx-auto flex min-h-[var(--app-height)] max-w-sm flex-col items-center justify-center gap-2 px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)] text-center">
      <h1 className="text-page-title">{t("errors.notFoundTitle")}</h1>
      <p className="text-small text-muted-foreground">{t("errors.notFoundBody")}</p>
      <Link href="/" replace className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-accent-soft px-5 text-button text-accent transition-transform duration-150 active:scale-[0.97]">
        {t("nav.home")}
      </Link>
    </main>
  );
}
