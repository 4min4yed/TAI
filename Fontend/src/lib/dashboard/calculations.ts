/**
 * Dashboard Business Logic & Calculations
 */

import { DashboardMetrics } from "@/types/dashboard";

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive or negative)
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate progress towards a target
 * @param current - Current value
 * @param target - Target value
 * @returns Percentage progress (0-100)
 */
export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

/**
 * Determine trend direction based on change value
 * @param change - Percentage or absolute change
 * @returns Trend direction
 */
export function getTrend(change: number): "up" | "down" | "neutral" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "neutral";
}

/**
 * Calculate average from array of numbers
 * @param values - Array of numeric values
 * @returns Average value
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate dashboard metrics summary
 * @param data - Raw data
 * @returns Aggregated metrics
 */
export function aggregateDashboardMetrics(
  data: any[],
): Partial<DashboardMetrics> {
  // This would typically aggregate from API data
  return {
    activeTenders: data.length,
    totalValue: data.reduce((sum, item) => sum + (item.value || 0), 0),
    successRate: calculateAverage(data.map((item) => item.successRate || 0)),
    avgComplianceScore: calculateAverage(
      data.map((item) => item.complianceScore || 0),
    ),
  };
}
