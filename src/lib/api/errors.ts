/** Normalized error for every failed API call. `code` mirrors the backend error codes. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields: Record<string, string[]> = {},
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string; fields?: Record<string, string[]>; details?: Record<string, unknown> };
}

export function toApiError(status: number, body: unknown): ApiError {
  const envelope = (body ?? {}) as ErrorEnvelope;
  return new ApiError(
    status,
    envelope.error?.code ?? "unknown_error",
    envelope.error?.message ?? "Unexpected error",
    envelope.error?.fields ?? {},
    envelope.error?.details ?? {},
  );
}
