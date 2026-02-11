/**
 * Dashboard Mappers (DTO → ViewModel)
 *
 * Goal:
 * - Convert backend DTOs (snake_case) → UI view models (camelCase)
 * - Runtime validation at the boundary (DTOs are untrusted)
 * - Pure functions (no formatting, no date parsing, no UI logic)
 * - Array mappers support fail-fast OR row-skipping (observability-friendly)
 *
 * Exports match services usage:
 * - mapDashboardMetrics
 * - mapActivityFeed
 * - mapTeamPerformance
 *
 * @version 1.0.1
 */

import type {
  DashboardSummary,
  DashboardSummaryDTO,
  ActivityItem,
  ActivityItemDTO,
  ActivityId,
  ActivityType,
  TeamMember,
  TeamMemberDTO,
  TeamMemberId,
  TeamRole,
} from "@/types/dashboard";

/* =========================
 * Constants (SSOT for validation)
 * ========================= */

const ACTIVITY_TYPES = [
  "upload",
  "approval",
  "deadline",
  "submission",
  "review",
  "update",
] as const satisfies readonly ActivityType[];

const TEAM_ROLES = [
  "bid_manager",
  "proposal_lead",
  "compliance_officer",
  "legal_reviewer",
  "pricing_manager",
  "observer",
] as const satisfies readonly TeamRole[];

/**
 * Optional exports (useful for UI dropdowns)
 */
export const DASHBOARD_ACTIVITY_TYPES = ACTIVITY_TYPES;
export const DASHBOARD_TEAM_ROLES = TEAM_ROLES;

/* =========================
 * Utilities
 * ========================= */

function assertNever(x: never): never {
  throw new Error(`[Dashboard Mapper] Unexpected value: ${String(x)}`);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isNonNegativeNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

function isNonNegativeInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

function isPercentage(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
}

/**
 * Stricter ISO 8601 timestamp check than Date.parse.
 * Accepts common backend formats: "2026-01-31T14:30:00Z" or "...+01:00"
 */
function isIsoDateString(v: unknown): v is string {
  if (typeof v !== "string") return false;

  // Basic ISO 8601 datetime: YYYY-MM-DDTHH:mm:ss(.sss)?(Z|+HH:MM)
  const ISO_REGEX =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

  if (!ISO_REGEX.test(v)) return false;

  const t = Date.parse(v);
  return !Number.isNaN(t);
}

function isActivityType(v: unknown): v is ActivityType {
  return (
    typeof v === "string" && (ACTIVITY_TYPES as readonly string[]).includes(v)
  );
}

function isTeamRole(v: unknown): v is TeamRole {
  return typeof v === "string" && (TEAM_ROLES as readonly string[]).includes(v);
}

/* =========================
 * Optional type guards (useful if you consume unknown JSON)
 * ========================= */

export function isDashboardSummaryDTO(v: unknown): v is DashboardSummaryDTO {
  if (!isRecord(v)) return false;
  return (
    typeof v.active_tenders === "number" &&
    typeof v.total_value === "number" &&
    typeof v.success_rate === "number" &&
    typeof v.avg_compliance_score === "number"
  );
}

export function isActivityItemDTO(v: unknown): v is ActivityItemDTO {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.type === "string" &&
    typeof v.message === "string" &&
    typeof v.timestamp === "string" &&
    typeof v.user === "string" &&
    (v.user_avatar === undefined || typeof v.user_avatar === "string")
  );
}

export function isTeamMemberDTO(v: unknown): v is TeamMemberDTO {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.role === "string" &&
    typeof v.active_tenders === "number" &&
    typeof v.completion_rate === "number" &&
    typeof v.avg_score === "number" &&
    (v.avatar === undefined || typeof v.avatar === "string")
  );
}

/* =========================
 * Dashboard Metrics (Summary) Mapper
 * ========================= */

export function mapDashboardMetrics(
  dto: DashboardSummaryDTO,
): DashboardSummary {
  if (!isNonNegativeInt(dto.active_tenders)) {
    throw new Error(
      `[Dashboard Mapper] Invalid active_tenders=${String(dto.active_tenders)} (expected non-negative integer)`,
    );
  }

  if (!isNonNegativeNumber(dto.total_value)) {
    throw new Error(
      `[Dashboard Mapper] Invalid total_value=${String(dto.total_value)} (expected non-negative number)`,
    );
  }

  if (
    !isPercentage(dto.success_rate) ||
    !isPercentage(dto.avg_compliance_score)
  ) {
    throw new Error(
      `[Dashboard Mapper] Invalid percentages: success_rate=${String(dto.success_rate)}, avg_compliance_score=${String(dto.avg_compliance_score)} (expected 0..100)`,
    );
  }

  return {
    activeTenders: dto.active_tenders,
    totalValue: dto.total_value,
    successRate: dto.success_rate,
    avgComplianceScore: dto.avg_compliance_score,
  };
}

/* =========================
 * Activity Feed Mappers
 * ========================= */

export function mapActivityItem(dto: ActivityItemDTO): ActivityItem {
  if (!isNonEmptyString(dto.id)) {
    throw new Error("[Dashboard Mapper] ActivityItemDTO.id missing/invalid");
  }

  if (!isActivityType(dto.type)) {
    throw new Error(
      `[Dashboard Mapper] Invalid ActivityItemDTO.type="${String(dto.type)}" (id=${dto.id})`,
    );
  }

  if (!isNonEmptyString(dto.message)) {
    throw new Error(
      `[Dashboard Mapper] ActivityItemDTO.message missing/invalid (id=${dto.id})`,
    );
  }

  if (!isIsoDateString(dto.timestamp)) {
    throw new Error(
      `[Dashboard Mapper] Invalid ActivityItemDTO.timestamp="${String(dto.timestamp)}" (id=${dto.id})`,
    );
  }

  if (!isNonEmptyString(dto.user)) {
    throw new Error(
      `[Dashboard Mapper] ActivityItemDTO.user missing/invalid (id=${dto.id})`,
    );
  }

  return {
    id: dto.id as ActivityId,
    type: dto.type,
    message: dto.message,
    timestamp: dto.timestamp,
    user: dto.user,
    userAvatar: dto.user_avatar,
  };
}

export type ActivityRowErrorHandler = (
  error: Error,
  dto: ActivityItemDTO,
) => void;

export function mapActivityFeed(
  dtos: ActivityItemDTO[],
  onRowError?: ActivityRowErrorHandler,
): ActivityItem[] {
  if (!Array.isArray(dtos)) {
    throw new Error("[Dashboard Mapper] Activity feed must be an array");
  }

  const out: ActivityItem[] = [];
  for (const dto of dtos) {
    try {
      out.push(mapActivityItem(dto));
    } catch (e) {
      if (onRowError) onRowError(e as Error, dto);
      else throw e;
    }
  }
  return out;
}

/**
 * Safe mapper: never throws, just skips invalid rows.
 * Handy for dashboard widgets that must render even with partial bad data.
 */
export function mapActivityFeedSafe(
  dtos: ActivityItemDTO[],
  onRowError?: ActivityRowErrorHandler,
): ActivityItem[] {
  return mapActivityFeed(dtos, onRowError ?? (() => {}));
}

/* =========================
 * Team Performance Mappers
 * ========================= */

export function mapTeamMember(dto: TeamMemberDTO): TeamMember {
  if (!isNonEmptyString(dto.id)) {
    throw new Error("[Dashboard Mapper] TeamMemberDTO.id missing/invalid");
  }

  if (!isNonEmptyString(dto.name)) {
    throw new Error(
      `[Dashboard Mapper] TeamMemberDTO.name missing/invalid (id=${dto.id})`,
    );
  }

  if (!isTeamRole(dto.role)) {
    throw new Error(
      `[Dashboard Mapper] Invalid TeamMemberDTO.role="${String(dto.role)}" (id=${dto.id}, name=${dto.name}). Expected one of: ${TEAM_ROLES.join(", ")}`,
    );
  }

  if (!isNonNegativeInt(dto.active_tenders)) {
    throw new Error(
      `[Dashboard Mapper] Invalid active_tenders=${String(dto.active_tenders)} (id=${dto.id})`,
    );
  }

  if (!isPercentage(dto.completion_rate) || !isPercentage(dto.avg_score)) {
    throw new Error(
      `[Dashboard Mapper] Invalid percentages for member (id=${dto.id}, name=${dto.name}): completion_rate=${String(dto.completion_rate)}, avg_score=${String(dto.avg_score)} (expected 0..100)`,
    );
  }

  const avatar = typeof dto.avatar === "string" ? dto.avatar : "";

  return {
    id: dto.id as TeamMemberId,
    name: dto.name,
    avatar,
    role: dto.role,
    activeTenders: dto.active_tenders,
    completionRate: dto.completion_rate,
    avgScore: dto.avg_score,
  };
}

export type TeamRowErrorHandler = (error: Error, dto: TeamMemberDTO) => void;

export function mapTeamPerformance(
  dtos: TeamMemberDTO[],
  onRowError?: TeamRowErrorHandler,
): TeamMember[] {
  if (!Array.isArray(dtos)) {
    throw new Error("[Dashboard Mapper] Team performance must be an array");
  }

  const out: TeamMember[] = [];
  for (const dto of dtos) {
    try {
      out.push(mapTeamMember(dto));
    } catch (e) {
      if (onRowError) onRowError(e as Error, dto);
      else throw e;
    }
  }
  return out;
}

/**
 * Safe mapper: never throws, just skips invalid rows.
 */
export function mapTeamPerformanceSafe(
  dtos: TeamMemberDTO[],
  onRowError?: TeamRowErrorHandler,
): TeamMember[] {
  return mapTeamPerformance(dtos, onRowError ?? (() => {}));
}

/* =========================
 * Backward-compatible validator alias
 * ========================= */

export function validateActivityItemDTO(v: unknown): v is ActivityItemDTO {
  return isActivityItemDTO(v);
}
