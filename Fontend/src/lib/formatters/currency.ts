/**
 * Currency Formatting Utilities
 * Formats numbers as currency values with proper localization
 */

export const CURRENCY_CONFIG = {
  locale: "en-US",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

export const EUR_CONFIG = {
  locale: "fr-FR",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - Currency code (USD, EUR, etc.)
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a large number with abbreviations (K, M, B)
 * @param value - The numeric value
 * @param currency - Currency symbol (optional)
 * @returns Abbreviated string (e.g., "2.5M", "$363.95M")
 */
export function formatCompactCurrency(
  value: number,
  currency: string = "$",
): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) {
    return `${sign}${currency}${(absValue / 1_000_000_000).toFixed(2)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}${currency}${(absValue / 1_000_000).toFixed(2)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}${currency}${(absValue / 1_000).toFixed(1)}K`;
  }
  return `${sign}${currency}${absValue.toFixed(2)}`;
}

/**
 * Parse a currency string to number
 * @param currencyString - String like "$2,500.00"
 * @returns Numeric value
 */
export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ""));
}
