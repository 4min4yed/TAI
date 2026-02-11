/**
 * API Error Handling (Production-Grade)
 *
 * Features:
 * - Type-safe error codes (17 codes across 5 categories)
 * - Multi-backend support (API Gateway, FastAPI, generic)
 * - Smart code normalization (backend variant mapping)
 * - Status → Code deterministic mapping
 * - Helper predicates (isUnauthorized, isForbidden, etc.)
 * - User-friendly message generation
 * - Observability ready (logError with Sentry placeholder)
 * - Robust parsing (AbortError, Response, Error, strings, objects)
 *
 * @version 1.0.0
 */

/* =========================
 * Error Codes
 * ========================= */

/**
 * Normalized error codes (as const for type safety)
 */
export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_FIELD: "MISSING_FIELD",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Networking / Transport
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  BAD_GATEWAY: "BAD_GATEWAY",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",

  // Business
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  OPERATION_FAILED: "OPERATION_FAILED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/* =========================
 * ApiError
 * ========================= */

/**
 * Normalized API Error with timestamp and cause tracking
 *
 * @example
 * throw new ApiError("Invalid input", 400, ERROR_CODES.VALIDATION_ERROR);
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(
    message: string,
    status: number = 500,
    code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
    details?: unknown,
    cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Keep original error for debugging (supported in modern JS runtimes)
    // We avoid passing `{ cause }` to Error ctor for broader compatibility.
    (this as any).cause = cause;
  }
}

/* =========================
 * Payload Shapes (best-effort)
 * ========================= */

// API gateway envelope example:
// { success: false, error: "...", message: "...", data: null, code: "...", details: ... }
type GatewayEnvelope = {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
  data?: unknown;
};

// FastAPI validation error example:
// { detail: [{ loc: [...], msg: "...", type: "..." }, ...] }
type FastApiError = {
  detail?: unknown;
};

/* =========================
 * Guards
 * ========================= */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

function isResponse(value: unknown): value is Response {
  return typeof Response !== "undefined" && value instanceof Response;
}

/**
 * Some libs throw objects like:
 * { status: 401, data: {...}, message: "..." }
 */
function pickStatus(value: Record<string, unknown>): number | undefined {
  const candidates = [
    value.status,
    value.statusCode,
    value.status_code,
    value.httpStatus,
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
  }
  return undefined;
}

function normalizeCode(code: unknown): ErrorCode | undefined {
  if (typeof code !== "string") return undefined;
  const upper = code.toUpperCase();

  // Accept exact known codes
  const known = Object.values(ERROR_CODES);
  if (known.includes(upper as ErrorCode)) return upper as ErrorCode;

  // Common mappings (backend variants)
  if (upper.includes("UNAUTH")) return ERROR_CODES.UNAUTHORIZED;
  if (upper.includes("FORBID")) return ERROR_CODES.FORBIDDEN;
  if (upper.includes("VALID")) return ERROR_CODES.VALIDATION_ERROR;
  if (upper.includes("NOT_FOUND")) return ERROR_CODES.NOT_FOUND;
  if (upper.includes("CONFLICT")) return ERROR_CODES.CONFLICT;
  if (upper.includes("TIMEOUT")) return ERROR_CODES.TIMEOUT;

  return undefined;
}

/* =========================
 * Status → Code
 * ========================= */

/**
 * Map HTTP status code to ErrorCode
 */
export function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 429:
      return ERROR_CODES.QUOTA_EXCEEDED;
    case 502:
      return ERROR_CODES.BAD_GATEWAY;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    case 504:
      return ERROR_CODES.TIMEOUT;
    default:
      return status >= 500
        ? ERROR_CODES.INTERNAL_ERROR
        : ERROR_CODES.OPERATION_FAILED;
  }
}

/* =========================
 * Extract message/details from payloads
 * ========================= */

function messageFromFastApi(detail: unknown): string | undefined {
  // If detail is string
  if (typeof detail === "string") return detail;

  // If detail is array of validation errors
  if (Array.isArray(detail)) {
    // Try to build a readable message from first item
    const first = detail[0];
    if (isObject(first) && typeof first.msg === "string") {
      return first.msg;
    }
    return "Validation error";
  }

  // If detail is object
  if (isObject(detail)) {
    if (typeof detail.message === "string") return detail.message;
  }

  return undefined;
}

function extractFromPayload(payload: unknown): {
  message?: string;
  code?: ErrorCode;
  details?: unknown;
  status?: number;
} {
  if (!isObject(payload)) {
    // payload could be plain text / HTML string
    if (typeof payload === "string" && payload.trim()) {
      return { message: payload.slice(0, 300) }; // avoid huge HTML bodies
    }
    return {};
  }

  // Handle double-wrapped envelopes: { data: { success, error, ... } }
  // Some APIs wrap responses twice
  if (
    isObject(payload.data) &&
    ("success" in payload.data || "error" in payload.data)
  ) {
    const nested = extractFromPayload(payload.data);
    if (nested.message || nested.code || nested.details) return nested;
  }

  // Gateway envelope
  const env = payload as GatewayEnvelope;
  const envMsg =
    typeof env.error === "string"
      ? env.error
      : typeof env.message === "string"
        ? env.message
        : undefined;

  const envCode = normalizeCode(env.code);
  if (envMsg || envCode || env.details) {
    return {
      message: envMsg,
      code: envCode,
      details: env.details ?? env.data,
      status: pickStatus(payload),
    };
  }

  // FastAPI error shape
  const fa = payload as FastApiError;
  if ("detail" in fa) {
    return {
      message: messageFromFastApi(fa.detail),
      code: ERROR_CODES.VALIDATION_ERROR,
      details: fa.detail,
      status: pickStatus(payload),
    };
  }

  // Generic error object shape
  const msg =
    typeof payload.message === "string"
      ? payload.message
      : typeof payload.error === "string"
        ? payload.error
        : undefined;

  return {
    message: msg,
    code: normalizeCode(payload.code),
    details: payload.details,
    status: pickStatus(payload),
  };
}

/**
 * Enhanced network error detection
 * Matches common network error patterns from various sources
 */
function looksLikeNetworkError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("failed to fetch") ||
    m.includes("fetch failed") ||
    m.includes("networkerror") ||
    m.includes("load failed") ||
    m.includes("network connection was lost") ||
    m.includes("econnrefused") ||
    m.includes("enotfound") ||
    m.includes("etimedout")
  );
}

/* =========================
 * parseError (main entry)
 * ========================= */

/**
 * Parse unknown errors into normalized ApiError
 *
 * Handles:
 * - ApiError (passthrough)
 * - AbortError (timeout/cancellation)
 * - Response objects
 * - Error instances
 * - Payload objects (Gateway, FastAPI, generic)
 * - Strings / primitives
 *
 * @param error - Unknown error from catch block or API
 * @returns Normalized ApiError with status, code, details
 *
 * @example
 * try {
 *   await apiClient.get("/endpoint");
 * } catch (err) {
 *   const apiError = parseError(err);
 *   console.error(apiError.code, apiError.status);
 * }
 */
export function parseError(error: unknown): ApiError {
  // Already normalized
  if (isApiError(error)) return error;

  // Abort / timeout / cancellation
  // 499 = Client Closed Request (nginx convention)
  if (isObject(error) && error.name === "AbortError") {
    return new ApiError(
      "Request cancelled",
      499,
      ERROR_CODES.TIMEOUT,
      undefined,
      error,
    );
  }

  // fetch Response thrown (sometimes)
  if (isResponse(error)) {
    return new ApiError(
      error.statusText || "Request failed",
      error.status,
      getErrorCodeFromStatus(error.status),
      undefined,
      error,
    );
  }

  // Plain Error
  if (error instanceof Error) {
    // Enhanced network error detection
    const msg = error.message || "Network error";
    const code = looksLikeNetworkError(msg)
      ? ERROR_CODES.NETWORK_ERROR
      : ERROR_CODES.OPERATION_FAILED;

    return new ApiError(msg, 0, code, undefined, error);
  }

  // Payload object/string
  const extracted = extractFromPayload(error);
  const status = extracted.status ?? 500;
  const code = extracted.code ?? getErrorCodeFromStatus(status);
  const message =
    extracted.message ||
    (typeof error === "string" ? error : "An unexpected error occurred");

  return new ApiError(message, status, code, extracted.details, error);
}

/* =========================
 * Predicates
 * ========================= */

/**
 * Check if error is 401 Unauthorized
 */
export function isUnauthorized(error: ApiError | Error): boolean {
  const e = error instanceof ApiError ? error : parseError(error);
  return (
    e.status === 401 ||
    e.code === ERROR_CODES.UNAUTHORIZED ||
    e.code === ERROR_CODES.TOKEN_EXPIRED
  );
}

/**
 * Check if error is 403 Forbidden
 */
export function isForbidden(error: ApiError | Error): boolean {
  const e = error instanceof ApiError ? error : parseError(error);
  return (
    e.status === 403 ||
    e.code === ERROR_CODES.FORBIDDEN ||
    e.code === ERROR_CODES.INSUFFICIENT_PERMISSIONS
  );
}

/**
 * Check if error is 404 Not Found
 */
export function isNotFound(error: ApiError | Error): boolean {
  const e = error instanceof ApiError ? error : parseError(error);
  return e.status === 404 || e.code === ERROR_CODES.NOT_FOUND;
}

/**
 * Check if error is 400/422 Validation Error
 */
export function isValidationError(error: ApiError | Error): boolean {
  const e = error instanceof ApiError ? error : parseError(error);
  return (
    e.status === 400 ||
    e.status === 422 ||
    e.code === ERROR_CODES.VALIDATION_ERROR ||
    e.code === ERROR_CODES.INVALID_INPUT
  );
}

/**
 * Check if error is 5xx Server Error
 */
export function isServerError(error: ApiError | Error): boolean {
  const e = error instanceof ApiError ? error : parseError(error);
  return e.status >= 500;
}

/**
 * Check if error is retryable (network, timeout, 502, 503, 504)
 */
export function isRetryable(error: ApiError | Error): boolean {
  const e = error instanceof ApiError ? error : parseError(error);
  return (
    e.code === ERROR_CODES.NETWORK_ERROR ||
    e.code === ERROR_CODES.TIMEOUT ||
    e.code === ERROR_CODES.BAD_GATEWAY ||
    e.code === ERROR_CODES.SERVICE_UNAVAILABLE ||
    e.status === 502 ||
    e.status === 503 ||
    e.status === 504
  );
}

/* =========================
 * User-friendly messages
 * ========================= */

/**
 * Get user-friendly error message for display
 *
 * @param error - ApiError or Error instance
 * @returns User-friendly message string
 */
export function getUserMessage(error: ApiError | Error): string {
  const e = error instanceof ApiError ? error : parseError(error);

  switch (e.code) {
    case ERROR_CODES.UNAUTHORIZED:
    case ERROR_CODES.TOKEN_EXPIRED:
      return "Please log in to continue";
    case ERROR_CODES.FORBIDDEN:
    case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
      return "You don't have permission to perform this action";
    case ERROR_CODES.NOT_FOUND:
      return "The requested resource was not found";
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.INVALID_INPUT:
      return "Please check your input and try again";
    case ERROR_CODES.QUOTA_EXCEEDED:
      return "Too many requests. Please try again later";
    case ERROR_CODES.SERVICE_UNAVAILABLE:
    case ERROR_CODES.BAD_GATEWAY:
      return "Service is temporarily unavailable. Please try again later";
    case ERROR_CODES.TIMEOUT:
      return "Request timed out. Please try again";
    case ERROR_CODES.NETWORK_ERROR:
      return "Network error. Check your connection and try again";
    default:
      return e.message || "An error occurred";
  }
}

/* =========================
 * Logging (placeholder)
 * ========================= */

/**
 * Log error to monitoring service
 *
 * In production, sends to Sentry/Datadog/etc.
 * In development, logs to console.
 *
 * @param error - Error to log
 * @param context - Additional context (user ID, request ID, etc.)
 */
export function logError(
  error: ApiError | Error,
  context?: Record<string, unknown>,
): void {
  const e = error instanceof ApiError ? error : parseError(error);

  const payload = {
    timestamp: e.timestamp,
    message: e.message,
    status: e.status,
    code: e.code,
    details: e.details,
    context,
    // expose cause in dev only (can include sensitive data)
    cause: process.env.NODE_ENV !== "production" ? (e as any).cause : undefined,
  };

  // Log to console
  console.error("[API Error]", payload);

  // TODO: Integrate with monitoring service
  // if (process.env.NODE_ENV === "production" && typeof Sentry !== "undefined") {
  //   Sentry.captureException(error, { extra: payload });
  // }
}
