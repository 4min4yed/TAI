/**
 * Common Validation Utilities
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date is in future
 * @param date - Date string or Date object
 * @returns True if date is in future
 */
export function isFutureDate(date: string | Date): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate > new Date();
}

/**
 * Validate required field is not empty
 * @param value - Value to check
 * @returns True if value is not empty
 */
export function isNotEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/**
 * Validate number is within range
 * @param value - Number to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate file extension
 * @param filename - File name
 * @param allowedExtensions - Array of allowed extensions (e.g., ['.pdf', '.docx'])
 * @returns True if extension is allowed
 */
export function hasValidExtension(
  filename: string,
  allowedExtensions: string[],
): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return allowedExtensions.some((ext) => ext.toLowerCase() === extension);
}
