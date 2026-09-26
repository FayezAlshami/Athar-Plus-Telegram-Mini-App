import { ApiError, toApiError } from "./errors";

const API_BASE_URL = `${(process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")}/api/v1`;

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Sent as Idempotency-Key; reuse the same key when retrying the same action. */
  idempotencyKey?: string;
  /** Internal: prevents infinite re-auth loops. */
  isRetry?: boolean;
}

interface SessionHooks {
  getToken: () => string | null;
  getLocale: () => string;
  /** Re-authenticates and returns a fresh token, or null if impossible. */
  refreshSession: () => Promise<string | null>;
}

let session: SessionHooks = {
  getToken: () => null,
  getLocale: () => "ar",
  refreshSession: async () => null,
};

/** Wired once by the AuthProvider so the client never imports React state. */
export function configureApiSession(hooks: SessionHooks): void {
  session = hooks;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

/** Low-level request returning the raw JSON body. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = session.getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": session.getLocale(),
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError(0, "network_error", "Network request failed");
  }

  if (response.status === 401 && !options.isRetry && path !== "/auth/telegram") {
    const refreshed = await session.refreshSession();
    if (refreshed) return apiFetch<T>(path, { ...options, isRetry: true });
  }

  if (response.status === 204) return undefined as T;

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw toApiError(response.status, body);

  return body as T;
}

/** Unwraps the standard `{ data }` envelope. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const body = await apiFetch<{ data: T }>(path, options);
  return body?.data;
}
