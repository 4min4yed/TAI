/**
 * Tender Domain Types
 *
 * Architecture:
 * - Branded IDs for type safety (prevent ID mixing)
 * - Single source of truth with `as const` patterns
 * - DTOs for API contract (snake_case)
 * - ViewModels for UI (camelCase)
 * - Runtime validation in mappers (fail-fast)
 * - ISO 4217 currency codes, ISO 8601 timestamps
 *
 * @version 1.0.0
 * @see https://en.wikipedia.org/wiki/ISO_4217
 */

/* =========================
 * BRANDED TYPES (Nominal Typing)
 * ========================= */

declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

export type TenderId = Brand<string, "TenderId">;
export type TenantId = Brand<string, "TenantId">;
export type UserId = Brand<string, "UserId">;

/* =========================
 * CONST ENUMS (Single Source of Truth)
 * ========================= */

export const TENDER_STATUSES = [
  "new",
  "in_progress",
  "in_review",
  "ready_to_submit",
  "submitted",
  "won",
  "lost",
  "cancelled",
] as const;

export type TenderStatus = (typeof TENDER_STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

/**
 * Common ISO 4217 currency codes
 * Extend as needed (150+ codes exist)
 */
export const SUPPORTED_CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
  "TND", // Tunisian Dinar
  "MAD", // Moroccan Dirham
  "DZD", // Algerian Dinar
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/* =========================
 * VALUE OBJECTS
 * ========================= */

/**
 * Money value object
 *
 * Design decision: Use float (number) for now.
 * Production alternative: Store minor units (cents) as integer for precision.
 * Example: $10.50 → { amountMinor: 1050, currency: "USD", scale: 2 }
 *
 * @see https://wiki.c2.com/?MoneyPattern
 */
export interface Money {
  amount: number; // Decimal value (e.g., 123.45)
  currency: CurrencyCode; // ISO 4217
}

/* =========================
 * UI VIEW MODEL (camelCase)
 * ========================= */

/**
 * Tender - UI/domain model
 *
 * This is the ergonomic, type-safe shape used throughout the UI.
 * All fields validated during DTO mapping.
 */
export interface Tender {
  readonly id: TenderId;

  title: string;
  buyer: string;

  status: TenderStatus;
  priority: Priority;

  /**
   * ISO 8601 deadline (UTC recommended)
   * @example "2026-02-15T23:59:59Z"
   */
  deadline: string;

  /**
   * Compliance score (validated 0..100)
   */
  compliancePercentage: number;

  /**
   * Count of missing documents (validated >= 0)
   */
  missingDocuments: number;

  /**
   * Total contract value with currency
   */
  totalValue: Money;

  /**
   * Assigned user (display name)
   */
  assigneeName: string;

  /**
   * Optional stable user ID (for future features)
   */
  assigneeId?: UserId;

  /**
   * Optional tenant ID (multi-tenant filtering)
   */
  tenantId?: TenantId;

  /**
   * ISO 8601 timestamps
   */
  readonly createdAt: string;
  readonly updatedAt: string;

  description?: string;
  tags?: readonly string[]; // Immutable tags
}

/* =========================
 * API DTOs (snake_case)
 * ========================= */

/**
 * TenderDTO - Backend API contract
 *
 * Keep stable. Version carefully.
 * All changes here are breaking API changes.
 */
export interface TenderDTO {
  id: string;

  title: string;
  buyer: string;

  status: string; // Validate to TenderStatus in mapper
  priority: string; // Validate to Priority in mapper

  deadline: string;

  compliance_percentage: number;
  missing_documents: number;

  total_value: number;
  currency: string; // Validate to CurrencyCode in mapper

  assignee: string;

  created_at: string;
  updated_at: string;

  description?: string;
  tags?: string[];
}

/**
 * Dashboard aggregation stats from backend
 */
export interface DashboardStatsDTO {
  total_tenders: number;
  active_tenders: number;
  compliance_avg: number; // 0..100
  pending_tasks: number;
  upcoming_deadlines: number;
  red_flags: number;
}

/* =========================
 * QUERY / FILTERING
 * ========================= */

export type TenderSortField =
  | "deadline"
  | "total_value"
  | "compliance_percentage"
  | "priority"
  | "status"
  | "created_at";

export type SortOrder = "asc" | "desc";

/**
 * TenderQuery - API query parameters
 *
 * Defaults:
 * - page: 1
 * - pageSize: 20
 * - sortBy: "created_at"
 * - sortOrder: "desc"
 */
export interface TenderQuery {
  status?: TenderStatus[];
  priority?: Priority[];
  buyer?: string;
  assignee?: string;

  /** ISO 8601 date range filter */
  dateFrom?: string;
  dateTo?: string;

  /** Full-text search query */
  search?: string;

  /** Pagination (1-based) */
  page?: number; // default: 1
  pageSize?: number; // default: 20

  /** Sorting */
  sortBy?: TenderSortField; // default: "created_at"
  sortOrder?: SortOrder; // default: "desc"
}

/**
 * Partial update payload (for PATCH endpoints)
 */
export type TenderUpdate = Partial<
  Pick<
    Tender,
    | "title"
    | "buyer"
    | "status"
    | "priority"
    | "deadline"
    | "description"
    | "tags"
    | "assigneeName"
  >
>;

/* =========================
 * VALIDATION GUARDS
 * ========================= */

export function isValidPercentage(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

export function isValidNonNegativeInt(n: number): boolean {
  return Number.isInteger(n) && n >= 0;
}

export function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function isValidTenderStatus(status: string): status is TenderStatus {
  return (TENDER_STATUSES as readonly string[]).includes(status);
}

export function isValidPriority(priority: string): priority is Priority {
  return (PRIORITIES as readonly string[]).includes(priority);
}

export function isValidCurrency(currency: string): currency is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(currency);
}

/* =========================
 * UTILITY FUNCTIONS
 * ========================= */

/**
 * Check if tender is in an active state (not won/lost/cancelled)
 */
export function isTenderActive(tender: Tender): boolean {
  return !["won", "lost", "cancelled"].includes(tender.status);
}

/**
 * Check if tender deadline has passed
 * @param now - Current time (injectable for testing)
 */
export function isTenderOverdue(
  tender: Tender,
  now: Date = new Date(),
): boolean {
  return new Date(tender.deadline).getTime() < now.getTime();
}

/**
 * Check if tender is high priority
 */
export function isHighPriority(tender: Tender): boolean {
  return tender.priority === "high";
}

/**
 * Get days until deadline (negative if overdue)
 */
export function getDaysUntilDeadline(tender: Tender): number {
  const now = new Date();
  const deadline = new Date(tender.deadline);
  const diffMs = deadline.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/* =========================
 * MAPPERS (DTO → View Model)
 * ========================= */

/**
 * Map TenderDTO from API to Tender view model
 *
 * Validates all fields. Throws on invalid data (fail-fast).
 *
 * @throws {Error} If validation fails
 */
export function mapTenderDTO(dto: TenderDTO): Tender {
  // Validate dates
  if (
    !isIsoDate(dto.deadline) ||
    !isIsoDate(dto.created_at) ||
    !isIsoDate(dto.updated_at)
  ) {
    throw new Error(
      `Invalid ISO date in TenderDTO (id=${dto.id}): deadline=${dto.deadline}, created_at=${dto.created_at}, updated_at=${dto.updated_at}`,
    );
  }

  // Validate status
  if (!isValidTenderStatus(dto.status)) {
    throw new Error(
      `Invalid status="${dto.status}" in TenderDTO (id=${dto.id}). Expected one of: ${TENDER_STATUSES.join(", ")}`,
    );
  }

  // Validate priority
  if (!isValidPriority(dto.priority)) {
    throw new Error(
      `Invalid priority="${dto.priority}" in TenderDTO (id=${dto.id}). Expected one of: ${PRIORITIES.join(", ")}`,
    );
  }

  // Validate currency
  if (!isValidCurrency(dto.currency)) {
    throw new Error(
      `Invalid currency="${dto.currency}" in TenderDTO (id=${dto.id}). Expected one of: ${SUPPORTED_CURRENCIES.join(", ")}`,
    );
  }

  // Validate percentage
  if (!isValidPercentage(dto.compliance_percentage)) {
    throw new Error(
      `Invalid compliance_percentage=${dto.compliance_percentage} in TenderDTO (id=${dto.id}). Expected 0..100`,
    );
  }

  // Validate count
  if (!isValidNonNegativeInt(dto.missing_documents)) {
    throw new Error(
      `Invalid missing_documents=${dto.missing_documents} in TenderDTO (id=${dto.id}). Expected integer >= 0`,
    );
  }

  return {
    id: dto.id as TenderId,
    title: dto.title,
    buyer: dto.buyer,

    status: dto.status,
    priority: dto.priority,

    deadline: dto.deadline,

    compliancePercentage: dto.compliance_percentage,
    missingDocuments: dto.missing_documents,

    totalValue: {
      amount: dto.total_value,
      currency: dto.currency,
    },

    assigneeName: dto.assignee,

    createdAt: dto.created_at,
    updatedAt: dto.updated_at,

    description: dto.description,
    tags: dto.tags ? ([...dto.tags] as readonly string[]) : undefined,
  };
}

/**
 * Map array of DTOs (with error handling)
 *
 * @param dtos - Array of TenderDTO from API
 * @param onError - Optional error handler (default: rethrow)
 * @returns Array of valid Tender view models
 */
export function mapTenderDTOs(
  dtos: TenderDTO[],
  onError?: (error: Error, dto: TenderDTO) => void,
): Tender[] {
  const results: Tender[] = [];

  for (const dto of dtos) {
    try {
      results.push(mapTenderDTO(dto));
    } catch (error) {
      if (onError) {
        onError(error as Error, dto);
      } else {
        throw error;
      }
    }
  }

  return results;
}
