import type { Priority, TenderStatus } from "./tender";

/**
 * Dashboard Type System
 *
 * Architecture:
 * - DTOs: Backend contract (snake_case, versionable, stable)
 * - View Models: UI layer (camelCase, ergonomic)
 * - Mappers: Pure DTO→ViewModel transformations with validation
 *
 * Principles:
 * - Framework-agnostic (no React in /types)
 * - ISO 8601 timestamps (parse/format in UI layer)
 * - Branded types for ID safety
 * - Runtime validation in mappers (DTOs are untrusted)
 * - Fail-fast on invalid data
 *
 * @version 1.0.0
 */

/* =========================
 * BRANDED TYPES (Nominal Typing)
 * ========================= */

/**
 * Branded ID types prevent accidental mixing (e.g., passing ActivityId as TeamMemberId)
 * Zero runtime cost - just compile-time safety
 */
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

export type ActivityId = Brand<string, "ActivityId">;
export type TeamMemberId = Brand<string, "TeamMemberId">;

/* =========================
 * UI VIEW MODELS (camelCase)
 * ========================= */

export interface DashboardSummary {
  activeTenders: number;
  totalValue: number; // aggregated in base currency (converted upstream)
  successRate: number; // 0..100 (validated in mapper)
  avgComplianceScore: number; // 0..100 (validated in mapper)
}

export type MetricIconKey =
  | "fileText"
  | "dollarSign"
  | "award"
  | "clock"
  | "checkCircle"
  | "alertTriangle"
  | "users"
  | "barChart";

export type Trend = "up" | "down" | "neutral";

export type MetricKey =
  | "activeTenders"
  | "totalValue"
  | "successRate"
  | "avgComplianceScore";

export interface MetricCardData {
  key: MetricKey;
  label: string;
  value: string | number;

  trend: Trend;
  changePct?: number; // Percentage change (e.g., 18.8 = +18.8%)
  changeLabel?: string; // Human-readable (e.g., "vs last month")

  iconKey: MetricIconKey;
}

/**
 * Activity types - single source of truth for runtime and type-level
 */
export const ACTIVITY_TYPES = [
  "upload",
  "approval",
  "deadline",
  "submission",
  "review",
  "update",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityItem {
  id: ActivityId; // Branded type prevents mixing IDs
  type: ActivityType;
  message: string;
  timestamp: string; // ISO 8601 (e.g., "2026-01-31T14:30:00Z")
  user: string;
  userAvatar?: string;
}

/**
 * Team roles - strict union for type safety
 * Single source of truth: array defines both runtime values and compile-time type
 */
export const TEAM_ROLES = [
  "bid_manager",
  "proposal_lead",
  "compliance_officer",
  "legal_reviewer",
  "pricing_manager",
  "observer",
] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export interface TeamMember {
  id: TeamMemberId; // Branded type
  name: string;
  avatar: string; // URL or data URI

  role: TeamRole;

  activeTenders: number; // >= 0
  completionRate: number; // 0..100
  avgScore: number; // 0..100
}

export interface TenderChartData {
  month: string; // ISO month format "2026-01" (sortable)
  submitted: number;
  won: number;
  lost: number;
}

export type ViewMode = "list" | "kanban";

export type SortField =
  | "deadline"
  | "value"
  | "compliance"
  | "priority"
  | "status";

export type SortOrder = "asc" | "desc";

export interface PipelineFilters {
  status: "all" | TenderStatus;
  priority: "all" | Priority;
  search: string;

  sortBy: SortField;
  sortOrder: SortOrder;
}

/* =========================
 * API DTOs (snake_case)
 * =========================
 * Backend contract - keep stable, version carefully
 * Any change here is a breaking API change
 */

export interface DashboardSummaryDTO {
  active_tenders: number;
  total_value: number;
  success_rate: number; // 0..100
  avg_compliance_score: number; // 0..100
}

export type ActivityTypeDTO =
  | "upload"
  | "approval"
  | "deadline"
  | "submission"
  | "review"
  | "update";

export interface ActivityItemDTO {
  id: string;
  type: ActivityTypeDTO;
  message: string;
  timestamp: string; // ISO 8601
  user: string;
  user_avatar?: string; // nullable in API
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  avatar: string;

  role: string; // Backend may send arbitrary strings - validate in mapper

  active_tenders: number;
  completion_rate: number; // 0..100
  avg_score: number; // 0..100
}

/* =========================
 * VALIDATION GUARDS
 * ========================= */

function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function isValidTeamRole(role: string): role is TeamRole {
  return (TEAM_ROLES as readonly string[]).includes(role);
}

function isValidActivityType(type: string): type is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(type);
}

/* =========================
 * MAPPERS (DTO → View Model)
 * =========================
 * Pure functions with runtime validation
 * Throw on invalid data (fail-fast)
 *
 * TODO: Move to services/dashboard/mappers.ts when API layer is ready
 */

export function mapDashboardSummaryDTO(
  dto: DashboardSummaryDTO,
): DashboardSummary {
  // Validate percentages
  if (
    !isValidPercentage(dto.success_rate) ||
    !isValidPercentage(dto.avg_compliance_score)
  ) {
    throw new Error(
      `Invalid percentage in DashboardSummaryDTO: success_rate=${dto.success_rate}, avg_compliance_score=${dto.avg_compliance_score}`,
    );
  }

  return {
    activeTenders: dto.active_tenders,
    totalValue: dto.total_value,
    successRate: dto.success_rate,
    avgComplianceScore: dto.avg_compliance_score,
  };
}

export function mapActivityItemDTO(dto: ActivityItemDTO): ActivityItem {
  if (!isValidActivityType(dto.type)) {
    throw new Error(`Invalid activity type: ${dto.type}`);
  }

  if (!isIsoDate(dto.timestamp)) {
    throw new Error(
      `Invalid ISO timestamp in ActivityItemDTO: ${dto.timestamp}. Expected ISO 8601 format (e.g., "2026-01-31T14:30:00Z")`,
    );
  }

  return {
    id: dto.id as ActivityId, // Brand the ID
    type: dto.type,
    message: dto.message,
    timestamp: dto.timestamp,
    user: dto.user,
    userAvatar: dto.user_avatar,
  };
}

export function mapTeamMemberDTO(dto: TeamMemberDTO): TeamMember {
  // Validate role
  if (!isValidTeamRole(dto.role)) {
    throw new Error(
      `Invalid team role: ${dto.role}. Expected one of: bid_manager, proposal_lead, compliance_officer, legal_reviewer, pricing_manager, observer`,
    );
  }

  // Validate percentages
  if (
    !isValidPercentage(dto.completion_rate) ||
    !isValidPercentage(dto.avg_score)
  ) {
    throw new Error(
      `Invalid percentage in TeamMemberDTO for ${dto.name}: completion_rate=${dto.completion_rate}, avg_score=${dto.avg_score}`,
    );
  }

  return {
    id: dto.id as TeamMemberId, // Brand the ID
    name: dto.name,
    avatar: dto.avatar,
    role: dto.role,
    activeTenders: dto.active_tenders,
    completionRate: dto.completion_rate,
    avgScore: dto.avg_score,
  };
}
