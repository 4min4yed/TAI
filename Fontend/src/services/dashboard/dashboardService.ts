/**
 * Dashboard Service (Production-Grade)
 *
 * Principles:
 * - Strong typing end-to-end (DTO → ViewModel)
 * - SSR-safe (no direct fetch/localStorage/window)
 * - Centralized error handling via apiClient
 * - AbortController support for request cancellation
 * - Input validation and defensive coding
 * - DRY with unwrap() helper for consistent error handling
 *
 * @version 1.1.0
 */

import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

// ViewModels (UI layer - camelCase)
import type {
  DashboardSummary,
  ActivityItem,
  TeamMember,
} from "@/types/dashboard";

// DTOs (API layer - snake_case)
import type {
  DashboardSummaryDTO,
  ActivityItemDTO,
  TeamMemberDTO,
} from "@/types/dashboard";

// Mappers (DTO → ViewModel transformations)
import {
  mapDashboardMetrics,
  mapActivityFeed,
  mapTeamPerformance,
} from "./mappers";

/* =========================
 * API Response Types
 * ========================= */

/**
 * API Response wrapper (API Gateway envelope)
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Activity feed response (DTO from backend)
 */
interface ActivityFeedResponseDTO {
  activities: ActivityItemDTO[];
  total: number;
  has_more: boolean; // snake_case from backend
}

/**
 * Team performance response (DTO from backend)
 */
interface TeamPerformanceResponseDTO {
  members: TeamMemberDTO[];
  total: number;
}

/**
 * Chart types (strict union for type safety)
 */
export type ChartType = "tender_flow" | "value_trend" | "compliance_trend";

/**
 * Chart period (strict union)
 */
export type ChartPeriod = "7d" | "30d" | "90d" | "1y";

/**
 * Export format (strict union)
 */
export type ExportFormat = "csv" | "xlsx" | "pdf";

/* =========================
 * Helper Functions
 * ========================= */

/**
 * Unwrap API response envelope with validation
 *
 * @throws {Error} If response is invalid or unsuccessful
 */
function unwrap<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.error || res?.message || "Request failed");
  }

  // Validate data exists
  if (res.data === undefined || res.data === null) {
    throw new Error("Response missing data field");
  }

  return res.data;
}

/**
 * Extract filename from Content-Disposition header
 *
 * @param contentDisposition - HTTP header value
 * @param defaultName - Fallback filename
 * @returns Extracted or default filename
 */
function extractFilename(
  contentDisposition: string | null,
  defaultName: string,
): string {
  if (!contentDisposition) return defaultName;

  const match = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
  );
  return match?.[1]?.replace(/['"]/g, "") || defaultName;
}

/* =========================
 * Service Functions
 * ========================= */

/**
 * Fetch dashboard metrics
 *
 * @param signal - AbortController signal for cancellation
 * @returns Dashboard summary with validated data
 * @throws {Error} If API call fails or validation fails
 */
export async function getDashboardMetrics(
  signal?: AbortSignal,
): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiResponse<DashboardSummaryDTO>>(
    ENDPOINTS.DASHBOARD.METRICS,
    { signal },
  );

  const dto = unwrap(response.data);
  return mapDashboardMetrics(dto);
}

/**
 * Fetch activity feed with pagination
 *
 * @param limit - Number of activities (1-100, default: 10)
 * @param offset - Pagination offset (default: 0)
 * @param signal - AbortController signal for cancellation
 * @returns Activity feed with pagination metadata
 * @throws {Error} If API call fails or validation fails
 */
export async function getActivityFeed(
  limit: number = 10,
  offset: number = 0,
  signal?: AbortSignal,
): Promise<{ activities: ActivityItem[]; total: number; hasMore: boolean }> {
  // Validate and clamp inputs (prevent API abuse)
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const safeOffset = Math.max(0, offset);

  const response = await apiClient.get<ApiResponse<ActivityFeedResponseDTO>>(
    ENDPOINTS.DASHBOARD.ACTIVITY,
    { params: { limit: safeLimit, offset: safeOffset }, signal },
  );

  const dto = unwrap(response.data);

  // Validate array type
  if (!Array.isArray(dto.activities)) {
    throw new Error(
      "Invalid activity feed response: activities must be an array",
    );
  }

  return {
    activities: mapActivityFeed(dto.activities),
    total: dto.total,
    hasMore: dto.has_more, // Map snake_case to camelCase
  };
}

/**
 * Fetch team performance data
 *
 * @param signal - AbortController signal for cancellation
 * @returns Array of team members with validated data
 * @throws {Error} If API call fails or validation fails
 */
export async function getTeamPerformance(
  signal?: AbortSignal,
): Promise<TeamMember[]> {
  const response = await apiClient.get<ApiResponse<TeamPerformanceResponseDTO>>(
    ENDPOINTS.DASHBOARD.TEAM_PERFORMANCE,
    { signal },
  );

  const dto = unwrap(response.data);

  // Validate array type
  if (!Array.isArray(dto.members)) {
    throw new Error(
      "Invalid team performance response: members must be an array",
    );
  }

  return mapTeamPerformance(dto.members);
}

/**
 * Fetch dashboard charts
 *
 * @param chartType - Type of chart (strict union)
 * @param period - Time period (default: 30d)
 * @param signal - AbortController signal for cancellation
 * @returns Chart data (type to be defined when backend contract is stable)
 * @throws {Error} If API call fails
 */
export async function getDashboardCharts(
  chartType: ChartType,
  period: ChartPeriod = "30d",
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await apiClient.get<ApiResponse<unknown>>(
    ENDPOINTS.DASHBOARD.CHARTS,
    { params: { type: chartType, period }, signal },
  );

  return unwrap(response.data);
}

/**
 * Export dashboard data (SSR-safe)
 *
 * Uses apiClient (no direct fetch/localStorage)
 * Returns Blob with filename extracted from Content-Disposition header
 *
 * @param format - Export format (csv, xlsx, pdf)
 * @param signal - AbortController signal for cancellation
 * @returns Object with blob and suggested filename
 *
 * @example
 * const { blob, filename } = await exportDashboardData("csv");
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement("a");
 * a.href = url;
 * a.download = filename;
 * a.click();
 * URL.revokeObjectURL(url);
 */
export async function exportDashboardData(
  format: ExportFormat = "csv",
  signal?: AbortSignal,
): Promise<{ blob: Blob; filename: string }> {
  const response = await apiClient.get(ENDPOINTS.ANALYTICS.EXPORT, {
    params: { format },
    responseType: "blob",
    signal,
  });

  // Extract filename from headers (nullish coalescing for safety)
  const contentDisposition =
    (response.headers?.["content-disposition"] as string | undefined) ?? null;

  const filename = extractFilename(
    contentDisposition,
    `dashboard-${new Date().toISOString().split("T")[0]}.${format}`,
  );

  return { blob: response.data as Blob, filename };
}
