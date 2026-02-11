/**
 * Pipeline Service (Production-Grade)
 *
 * Principles:
 * - DTO → ViewModel mapping (snake_case → camelCase)
 * - Strong typing with TenderStatus/Priority (domain types)
 * - SSR-safe (no window/localStorage)
 * - AbortSignal support for cancellation
 * - Consistent envelope unwrapping with unwrap()
 * - Branded IDs (TenderId, UserId) to prevent mixing
 * - Defensive validation for list endpoints (skip invalid rows)
 *
 * @version 1.0.1
 */

import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

// ViewModels (UI layer - camelCase)
import type {
  Tender,
  TenderId,
  TenderQuery,
  TenderUpdate,
  TenderStatus,
  UserId,
} from "@/types/tender";

// DTOs (API layer - snake_case)
import type { TenderDTO, DashboardStatsDTO } from "@/types/tender";

// Mappers (DTO → ViewModel transformations)
import { mapTenderDTO, mapTenderDTOs } from "./pipelineMappers";

/* =========================
 * API Envelope
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
 * Unwrap API response envelope with validation
 *
 * @throws {Error} If response is invalid or unsuccessful
 */
function unwrap<T>(res: ApiResponse<T>): T {
  if (!res || res.success !== true) {
    throw new Error(res?.error || res?.message || "Request failed");
  }
  if (res.data === undefined || res.data === null) {
    throw new Error("Response missing data field");
  }
  return res.data;
}

/**
 * Convert branded TenderId to string for API calls
 */
function toIdString(id: TenderId): string {
  return id as unknown as string;
}

/**
 * Convert branded UserId to string for API calls
 */
function toUserIdString(id: UserId): string {
  return id as unknown as string;
}

/* =========================
 * DTO Payloads
 * ========================= */

/**
 * Pipeline list response (DTO from backend)
 */
interface PipelineListDTO {
  tenders: TenderDTO[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean; // snake_case from backend
}

/* =========================
 * UI Return Types
 * ========================= */

/**
 * Pipeline list result (ViewModel for UI)
 */
export interface PipelineListResult {
  tenders: Tender[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean; // camelCase for UI
}

/* =========================
 * Query Parameters
 * ========================= */

/**
 * Pipeline query parameters (subset of TenderQuery)
 */
export interface PipelineParams extends Pick<
  TenderQuery,
  | "status"
  | "priority"
  | "search"
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortOrder"
> {}

/**
 * Normalized pipeline parameters with required page/pageSize
 */
type NormalizedPipelineParams = Required<
  Pick<TenderQuery, "page" | "pageSize">
> &
  Omit<PipelineParams, "page" | "pageSize">;

/**
 * Normalize and validate pipeline parameters
 *
 * @param params - Raw parameters from UI
 * @returns Validated parameters with safe defaults
 */
function normalizePipelineParams(
  params?: PipelineParams,
): NormalizedPipelineParams {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.min(Math.max(1, params?.pageSize ?? 20), 100);

  return {
    ...params,
    page,
    pageSize,
  };
}

/**
 * Optional error handler for list mapping
 *
 * Production best practice: log to Sentry/Datadog to track bad data
 * instead of crashing the entire page when one row is invalid.
 *
 * @param error - Validation error from mapper
 * @param dto - The invalid DTO that caused the error
 */
export type ListMapErrorHandler = (error: Error, dto: TenderDTO) => void;

/* =========================
 * Service Functions
 * ========================= */

/**
 * Fetch pipeline data with filters and pagination
 *
 * Backend expects:
 * - status: comma-separated string ("draft,active") or undefined
 * - priority: comma-separated string ("high,critical") or undefined
 * - page: 1-based index
 * - limit: items per page (1-100)
 *
 * @param params - Filter and pagination parameters
 * @param signal - AbortController signal for cancellation
 * @param onRowError - Optional error handler for invalid rows (skip instead of crash)
 * @returns Pipeline list with tenders and metadata
 * @throws {Error} If API call fails or validation fails
 *
 * @example
 * // Skip invalid rows and log to monitoring
 * const result = await getPipelineData(
 *   { status: ["active"], page: 1 },
 *   signal,
 *   (error, dto) => {
 *     console.error("Invalid tender DTO:", dto.id, error);
 *     Sentry.captureException(error, { extra: { dto } });
 *   }
 * );
 */
export async function getPipelineData(
  params?: PipelineParams,
  signal?: AbortSignal,
  onRowError?: ListMapErrorHandler,
): Promise<PipelineListResult> {
  const safe = normalizePipelineParams(params);

  const response = await apiClient.get<ApiResponse<PipelineListDTO>>(
    ENDPOINTS.TENDERS.PIPELINE,
    {
      params: {
        // Backend expects comma-separated strings for multi-select filters
        status: safe.status?.length ? safe.status.join(",") : undefined,
        priority: safe.priority?.length ? safe.priority.join(",") : undefined,
        search: safe.search,
        page: safe.page,
        limit: safe.pageSize, // Backend uses 'limit' parameter
        sortBy: safe.sortBy,
        sortOrder: safe.sortOrder,
      },
      signal,
    },
  );

  const dto = unwrap(response.data);

  // Validate array type
  if (!Array.isArray(dto.tenders)) {
    throw new Error("Invalid pipeline response: tenders must be an array");
  }

  // For list views: optionally skip bad rows instead of crashing the page
  const tenders = onRowError
    ? mapTenderDTOs(dto.tenders, onRowError)
    : mapTenderDTOs(dto.tenders);

  return {
    tenders,
    total: dto.total,
    page: dto.page,
    limit: dto.limit,
    hasMore: dto.has_more, // Map snake_case to camelCase
  };
}

/**
 * Fetch pipeline statistics
 *
 * @param signal - AbortController signal for cancellation
 * @returns Dashboard statistics (DTO - no mapping needed for stats)
 * @throws {Error} If API call fails
 */
export async function getPipelineStats(
  signal?: AbortSignal,
): Promise<DashboardStatsDTO> {
  const response = await apiClient.get<ApiResponse<DashboardStatsDTO>>(
    ENDPOINTS.TENDERS.STATS,
    { signal },
  );

  return unwrap(response.data);
}

/**
 * Fetch tender details by ID
 *
 * @param id - Tender ID (branded type)
 * @param signal - AbortController signal for cancellation
 * @returns Tender with full details (ViewModel)
 * @throws {Error} If API call fails or validation fails
 */
export async function getTenderDetails(
  id: TenderId,
  signal?: AbortSignal,
): Promise<Tender> {
  const response = await apiClient.get<ApiResponse<TenderDTO>>(
    ENDPOINTS.TENDERS.DETAIL(toIdString(id)),
    { signal },
  );

  return mapTenderDTO(unwrap(response.data));
}

/**
 * Create new tender
 *
 * @param payload - Tender data (partial for creation)
 * @param signal - AbortController signal for cancellation
 * @returns Created tender (ViewModel)
 * @throws {Error} If API call fails or validation fails
 */
export async function createTender(
  payload: Partial<TenderUpdate>,
  signal?: AbortSignal,
): Promise<Tender> {
  const response = await apiClient.post<ApiResponse<TenderDTO>>(
    ENDPOINTS.TENDERS.CREATE,
    payload,
    { signal },
  );

  return mapTenderDTO(unwrap(response.data));
}

/**
 * Update existing tender
 *
 * @param id - Tender ID (branded type)
 * @param payload - Fields to update
 * @param signal - AbortController signal for cancellation
 * @returns Updated tender (ViewModel)
 * @throws {Error} If API call fails or validation fails
 */
export async function updateTender(
  id: TenderId,
  payload: Partial<TenderUpdate>,
  signal?: AbortSignal,
): Promise<Tender> {
  const response = await apiClient.put<ApiResponse<TenderDTO>>(
    ENDPOINTS.TENDERS.UPDATE(toIdString(id)),
    payload,
    { signal },
  );

  return mapTenderDTO(unwrap(response.data));
}

/**
 * Delete tender by ID
 *
 * @param id - Tender ID (branded type)
 * @param signal - AbortController signal for cancellation
 * @throws {Error} If API call fails
 */
export async function deleteTender(
  id: TenderId,
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ ok: true }>>(
    ENDPOINTS.TENDERS.DELETE(toIdString(id)),
    { signal },
  );

  unwrap(response.data); // Validate success
}

/**
 * Bulk update multiple tenders
 *
 * @param ids - Array of tender IDs to update
 * @param updates - Fields to update on all tenders
 * @param signal - AbortController signal for cancellation
 * @throws {Error} If API call fails
 */
export async function bulkUpdateTenders(
  ids: TenderId[],
  updates: Partial<TenderUpdate>,
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiClient.post<ApiResponse<{ ok: true }>>(
    ENDPOINTS.TENDERS.BULK_UPDATE,
    {
      tender_ids: ids.map(toIdString),
      updates,
    },
    { signal },
  );

  unwrap(response.data); // Validate success
}

/**
 * Assign tender to user
 *
 * @param tenderId - Tender ID to assign
 * @param userId - User ID to assign to (branded type)
 * @param signal - AbortController signal for cancellation
 * @throws {Error} If API call fails
 */
export async function assignTender(
  tenderId: TenderId,
  userId: UserId,
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiClient.patch<ApiResponse<{ ok: true }>>(
    ENDPOINTS.TENDERS.ASSIGN(toIdString(tenderId)),
    { assignee_id: toUserIdString(userId) },
    { signal },
  );

  unwrap(response.data); // Validate success
}

/**
 * Update tender status
 *
 * @param tenderId - Tender ID to update
 * @param status - New status value (branded type prevents invalid statuses)
 * @param signal - AbortController signal for cancellation
 * @throws {Error} If API call fails
 */
export async function updateTenderStatus(
  tenderId: TenderId,
  status: TenderStatus,
  signal?: AbortSignal,
): Promise<void> {
  const response = await apiClient.patch<ApiResponse<{ ok: true }>>(
    ENDPOINTS.TENDERS.STATUS(toIdString(tenderId)),
    { status },
    { signal },
  );

  unwrap(response.data); // Validate success
}
