/**
 * API Client (Production-Grade)
 *
 * Features:
 * - SSR-safe by design (pluggable token provider; no hard dependency on localStorage)
 * - Strong error handling (ApiError + parseError fallback)
 * - AbortSignal support with timeout composition
 * - Query params serialization (supports arrays: repeat or comma-separated)
 * - Response parsing by responseType: "json" | "text" | "blob"
 * - No forced "Content-Type" for GET or FormData uploads
 * - Public endpoint support (skipAuth flag)
 * - Automatic token refresh on 401 with retry
 * - Request tracing (X-Request-Id header)
 * - Configurable timeout per request or globally
 *
 * @version 1.1.0
 */

import { ApiError, parseError } from "./errors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8000";

/* =========================
 * Types
 * ========================= */

type Primitive = string | number | boolean;
type ParamValue = Primitive | Primitive[] | undefined | null;

/**
 * Response type for different content types
 */
export type ResponseType = "json" | "text" | "blob";

/**
 * How to serialize array query params.
 * - "repeat": status=a&status=b (default, Django REST Framework compatible)
 * - "comma":  status=a,b (some APIs prefer this)
 */
export type ArrayFormat = "repeat" | "comma";

/**
 * Request configuration
 */
export interface RequestConfig extends Omit<RequestInit, "body" | "headers"> {
  /** Query parameters (supports arrays for repeated params) */
  params?: Record<string, ParamValue>;
  /** Expected response type (default: "json") */
  responseType?: ResponseType;
  /**
   * When true, won't attach Authorization header even if token exists.
   * Useful for public endpoints.
   */
  skipAuth?: boolean;

  /** Overrides default timeoutMs (default: 30000ms) */
  timeoutMs?: number;

  /** Optional per-request correlation id (auto-generated if not provided) */
  requestId?: string;

  /** Controls array query serialization (default: "repeat") */
  arrayFormat?: ArrayFormat;

  /** Headers (accepts HeadersInit: object, array, or Headers instance) */
  headers?: HeadersInit;

  /**
   * If true, client may attempt refresh on 401 once and retry request once.
   * Default: true (can be disabled per request).
   */
  retryOnUnauthorized?: boolean;
}

/**
 * Token provider interface (pluggable for SSR)
 */
export interface TokenProvider {
  getToken: () => string | null;
}

/**
 * Optional: if you support refresh tokens,
 * implement this to refresh and return the new access token.
 */
export interface AuthRefresher {
  refresh: () => Promise<string | null>;
}

/* =========================
 * Default Token Provider
 * ========================= */

/**
 * Default token provider (client-side only).
 * In SSR, it returns null — later you can inject a cookie-based provider.
 */
const defaultTokenProvider: TokenProvider = {
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },
};

/* =========================
 * Helper Functions
 * ========================= */

/**
 * Normalize endpoint to ensure leading slash
 */
function normalizeEndpoint(endpoint: string): string {
  if (!endpoint) return "/";
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

/**
 * Join base URL with endpoint
 */
function joinUrl(baseURL: string, endpoint: string): string {
  return new URL(normalizeEndpoint(endpoint), baseURL).toString();
}

/**
 * Append query parameters to URL
 * Supports arrays with configurable format
 */
function appendParams(
  url: string,
  params?: Record<string, ParamValue>,
  arrayFormat: ArrayFormat = "repeat",
): string {
  if (!params) return url;
  const u = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      if (arrayFormat === "comma") {
        if (value.length)
          u.searchParams.append(key, value.map(String).join(","));
      } else {
        // repeat format (default)
        value.forEach((v) => u.searchParams.append(key, String(v)));
      }
      return;
    }

    u.searchParams.append(key, String(value));
  });

  return u.toString();
}

/**
 * Type guard for FormData
 */
function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

/**
 * Robust header merge for HeadersInit types:
 * - object
 * - array tuples
 * - Headers instance
 */
function mergeHeaders(...inputs: Array<HeadersInit | undefined>): Headers {
  const out = new Headers();
  for (const input of inputs) {
    if (!input) continue;
    const h = new Headers(input);
    h.forEach((v, k) => out.set(k, v));
  }
  return out;
}

/**
 * Check if Headers instance has a header (case-insensitive)
 */
function hasHeader(headers: Headers, name: string): boolean {
  return headers.has(name);
}

/**
 * Timeout wrapper that still respects an external AbortSignal
 * Composes timeout with existing signal (both can abort)
 */
function withTimeout(
  signal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  if (timeoutMs <= 0) return signal ?? new AbortController().signal;

  const ctrl = new AbortController();

  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  const onAbort = () => ctrl.abort();
  if (signal) signal.addEventListener("abort", onAbort, { once: true });

  ctrl.signal.addEventListener(
    "abort",
    () => {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
    },
    { once: true },
  );

  return ctrl.signal;
}

/**
 * Generate request ID for tracing
 */
function safeRequestId(given?: string): string {
  // simple, deterministic enough for client side; can be replaced by UUID later
  return given ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* =========================
 * API Client Class
 * ========================= */

class ApiClient {
  private baseURL: string;
  private tokenProvider: TokenProvider;
  private authRefresher?: AuthRefresher;

  private defaultTimeoutMs = 30_000; // 30 seconds

  constructor(
    baseURL: string,
    tokenProvider: TokenProvider = defaultTokenProvider,
    authRefresher?: AuthRefresher,
  ) {
    this.baseURL = baseURL;
    this.tokenProvider = tokenProvider;
    this.authRefresher = authRefresher;
  }

  /**
   * Allows plugging a different token provider (cookies / server headers / etc.)
   *
   * @example
   * // For SSR with cookies
   * apiClient.setTokenProvider({
   *   getToken: () => cookies().get("auth_token")?.value ?? null
   * });
   */
  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  /**
   * Set auth refresher for automatic token refresh on 401
   *
   * @example
   * apiClient.setAuthRefresher({
   *   refresh: async () => {
   *     const res = await fetch("/api/v1/auth/refresh", { method: "POST" });
   *     const data = await res.json();
   *     return data.access_token;
   *   }
   * });
   */
  setAuthRefresher(refresher?: AuthRefresher) {
    this.authRefresher = refresher;
  }

  /**
   * Set default timeout for all requests
   * Can be overridden per-request with config.timeoutMs
   */
  setDefaultTimeoutMs(ms: number) {
    this.defaultTimeoutMs = ms;
  }

  /**
   * Build request headers
   * - Sets Content-Type: application/json only for JSON body (not FormData)
   * - Adds X-Request-Id for distributed tracing
   * - Adds Authorization header unless skipAuth is true
   * - Respects caller's custom headers (merged with Headers class)
   */
  private buildHeaders(config?: RequestConfig, body?: unknown): Headers {
    const base = new Headers();

    // Only set JSON content-type if we are sending JSON (not FormData)
    if (body !== undefined && body !== null && !isFormData(body)) {
      base.set("Content-Type", "application/json");
    }

    // Observability / tracing
    base.set("X-Request-Id", safeRequestId(config?.requestId));

    // Merge: base -> caller headers (caller wins)
    const merged = mergeHeaders(base, config?.headers);

    // Auth
    if (!config?.skipAuth) {
      const token = this.tokenProvider.getToken();
      if (token && !hasHeader(merged, "Authorization")) {
        merged.set("Authorization", `Bearer ${token}`);
      }
    }

    return merged;
  }

  /**
   * Parse response based on responseType
   * Handles empty responses (204 No Content)
   */
  private async parseResponse<T>(
    response: Response,
    responseType: ResponseType,
  ): Promise<T> {
    if (responseType === "blob") return (await response.blob()) as unknown as T;
    if (responseType === "text") return (await response.text()) as unknown as T;

    // json
    const text = await response.text();
    if (!text) return undefined as unknown as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError("Invalid JSON response from server", response.status);
    }
  }

  /**
   * Build ApiError from failed response
   * Handles both JSON and non-JSON error responses
   */
  private async buildApiError(response: Response): Promise<ApiError> {
    // Try JSON first
    let payload: unknown = null;
    try {
      const txt = await response.text();
      payload = txt ? JSON.parse(txt) : null;
    } catch {
      // fallback: read as text (HTML, plain text, etc.)
      try {
        const txt = await response.text();
        payload = txt || null;
      } catch {
        payload = null;
      }
    }

    const parsed = parseError(payload);

    return new ApiError(
      parsed?.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      parsed?.code,
      parsed?.details,
    );
  }

  /**
   * Execute fetch with timeout and signal composition
   * Throws ApiError on failure
   */
  private async doFetch<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    body: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    const responseType: ResponseType = config?.responseType ?? "json";
    const arrayFormat: ArrayFormat = config?.arrayFormat ?? "repeat";
    const timeoutMs = config?.timeoutMs ?? this.defaultTimeoutMs;

    const url = appendParams(
      joinUrl(this.baseURL, endpoint),
      config?.params,
      arrayFormat,
    );

    const headers = this.buildHeaders(config, body);

    const signal = withTimeout(config?.signal, timeoutMs);

    const init: RequestInit = {
      ...config,
      method,
      headers,
      signal,
      body:
        body === undefined || body === null
          ? undefined
          : isFormData(body)
            ? (body as FormData)
            : JSON.stringify(body),
    };

    const res = await fetch(url, init);

    if (res.ok) {
      return this.parseResponse<T>(res, responseType);
    }

    throw await this.buildApiError(res);
  }

  /**
   * Unified request method with automatic token refresh on 401
   */
  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    try {
      return await this.doFetch<T>(method, endpoint, body, config);
    } catch (err) {
      // Optional: refresh token once on 401 + retry once
      const retryEnabled = config?.retryOnUnauthorized ?? true;

      if (
        retryEnabled &&
        this.authRefresher &&
        err instanceof ApiError &&
        err.status === 401
      ) {
        const newToken = await this.authRefresher.refresh();
        if (newToken) {
          // if client-side, you can store it; otherwise tokenProvider could use it directly
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", newToken);
          }
          // retry once
          return await this.doFetch<T>(method, endpoint, body, config);
        }
      }

      throw err;
    }
  }

  /* =========================
   * Public HTTP Methods
   * ========================= */

  /**
   * GET request
   *
   * @param endpoint - API endpoint path
   * @param config - Request configuration (params, signal, headers, etc.)
   * @returns Parsed response
   *
   * @example
   * const data = await apiClient.get("/api/v1/tenders", {
   *   params: { status: ["active", "draft"], page: 1 },
   *   signal: abortController.signal
   * });
   */
  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>("GET", endpoint, undefined, config);
  }

  /**
   * POST request
   *
   * @param endpoint - API endpoint path
   * @param data - Request body (will be JSON.stringify'd)
   * @param config - Request configuration
   * @returns Parsed response
   */
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>("POST", endpoint, data, config);
  }

  /**
   * PUT request
   *
   * @param endpoint - API endpoint path
   * @param data - Request body (will be JSON.stringify'd)
   * @param config - Request configuration
   * @returns Parsed response
   */
  put<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>("PUT", endpoint, data, config);
  }

  /**
   * PATCH request
   *
   * @param endpoint - API endpoint path
   * @param data - Request body (will be JSON.stringify'd)
   * @param config - Request configuration
   * @returns Parsed response
   */
  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>("PATCH", endpoint, data, config);
  }

  /**
   * DELETE request
   *
   * @param endpoint - API endpoint path
   * @param config - Request configuration
   * @returns Parsed response
   */
  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>("DELETE", endpoint, undefined, config);
  }

  /**
   * Upload file (FormData)
   * - Never sets Content-Type (browser will set multipart/form-data boundary)
   *
   * @param endpoint - API endpoint path
   * @param file - File to upload
   * @param additionalData - Extra form fields (supports arrays)
   * @param config - Request configuration (no params/responseType allowed)
   * @returns Parsed response
   *
   * @example
   * const result = await apiClient.uploadFile(
   *   "/api/v1/documents/upload",
   *   file,
   *   { tenderId: "123", tags: ["important", "urgent"] }
   * );
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, ParamValue>,
    config?: Omit<RequestConfig, "params" | "responseType">,
  ): Promise<T> {
    const form = new FormData();
    form.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) v.forEach((x) => form.append(k, String(x)));
        else form.append(k, String(v));
      });
    }

    return this.request<T>("POST", endpoint, form, {
      ...config,
      responseType: "json",
    });
  }
}

/* =========================
 * Exports
 * ========================= */

// Singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export class for tests / custom instances
export { ApiClient };
export type { TokenProvider, AuthRefresher };
