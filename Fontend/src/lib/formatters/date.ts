/**
 * Date Formatting Utilities
 * Formats dates in various human-readable formats
 */

/**
 * Format a date as relative time (e.g., "2 minutes ago", "3 days left")
 * @param date - Date string or Date object
 * @param suffix - Suffix to add (e.g., "ago", "left")
 * @returns Relative time string
 */
export function formatRelativeDate(
  date: string | Date,
  suffix: "ago" | "left" = "ago",
): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffMs =
    suffix === "ago"
      ? now.getTime() - targetDate.getTime()
      : targetDate.getTime() - now.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return `${diffSeconds} seconds ${suffix}`;
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ${suffix}`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ${suffix}`;
  if (diffDays < 7)
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ${suffix}`;
  if (diffWeeks < 4)
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ${suffix}`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ${suffix}`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ${suffix}`;
}

/**
 * Format a date as short format (e.g., "Jan 31, 2026")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatShortDate(date: string | Date): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as long format (e.g., "Friday, January 31, 2026")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatLongDate(date: string | Date): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date range (e.g., "Jan 18 - Feb 18")
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
): string {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}
