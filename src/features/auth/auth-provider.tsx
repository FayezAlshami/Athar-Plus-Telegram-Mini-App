"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthSession, User } from "@/entities/user/types";
import { configureApiSession } from "@/lib/api/client";
import { accountApi, authApi } from "@/lib/api/endpoints";
import { isApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { writeCookie } from "@/lib/cookies";
import { track } from "@/lib/analytics/events";
import { warmSession } from "@/features/catalog/warm-session";
import type { TelegramAdapter } from "@/lib/telegram/adapter";
import { routeForStartParam } from "@/lib/telegram/start-param";
import { useTelegramState } from "@/lib/telegram/telegram-provider";

type AuthStatus = "authenticating" | "authenticated" | "failed" | "unavailable";

type SignInOutcome = { attempt: number; status: "authenticated" | "failed"; errorCode: string | null };

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  errorCode: string | null;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authenticate(adapter: TelegramAdapter): Promise<AuthSession> {
  if (adapter.kind === "mock" && adapter.user) {
    return authApi.development({ ...adapter.user });
  }
  return authApi.telegram(adapter.initData);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const telegram = useTelegramState();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [attempt, setAttempt] = useState(0);
  // Written only from async sign-in callbacks; tagged with the attempt it belongs to.
  const [outcome, setOutcome] = useState<SignInOutcome | null>(null);

  const tokenRef = useRef<string | null>(null);
  const localeRef = useRef(locale);
  const deepLinkHandled = useRef(false);
  const warmed = useRef(false);
  const initialPath = useRef(pathname);

  // Server content is localized via Accept-Language, so a language change refetches everything.
  useEffect(() => {
    if (localeRef.current === locale) return;
    localeRef.current = locale;
    void queryClient.invalidateQueries();
  }, [locale, queryClient]);

  const signIn = useCallback(
    async (adapter: TelegramAdapter): Promise<AuthSession> => {
      const session = await authenticate(adapter);
      tokenRef.current = session.access_token;
      queryClient.setQueryData(queryKeys.profile, session.user);
      return session;
    },
    [queryClient],
  );

  useEffect(() => {
    if (telegram.status !== "ready") return;

    const adapter = telegram.adapter;
    configureApiSession({
      getToken: () => tokenRef.current,
      getLocale: () => localeRef.current,
      refreshSession: async () => {
        try {
          return (await signIn(adapter)).access_token;
        } catch {
          return null;
        }
      },
    });

    let cancelled = false;

    signIn(adapter)
      .then((session) => {
        if (cancelled) return;
        setOutcome({ attempt, status: "authenticated", errorCode: null });
        track("app_opened", { platform: adapter.platform });
        if (!warmed.current) {
          warmed.current = true;
          warmSession(queryClient);
        }

        if (session.user.locale !== localeRef.current) {
          writeCookie(LOCALE_COOKIE, session.user.locale);
          router.refresh();
        }

        const deepLink = routeForStartParam(session.start_param ?? adapter.startParam);
        if (deepLink && !deepLinkHandled.current && initialPath.current === "/") {
          deepLinkHandled.current = true;
          router.push(deepLink);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        tokenRef.current = null;
        setOutcome({ attempt, status: "failed", errorCode: isApiError(error) ? error.code : "unknown_error" });
      });

    return () => {
      cancelled = true;
    };
  }, [telegram, signIn, router, attempt, queryClient]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const user = useQuery({ queryKey: queryKeys.profile, queryFn: () => accountApi.profile(), enabled: false }).data ?? null;

  const status: AuthStatus =
    telegram.status === "unavailable"
      ? "unavailable"
      : telegram.status === "loading" || outcome?.attempt !== attempt
        ? "authenticating"
        : outcome.status;

  return (
    <AuthContext.Provider value={{ status, user, errorCode: outcome?.errorCode ?? null, retry }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
