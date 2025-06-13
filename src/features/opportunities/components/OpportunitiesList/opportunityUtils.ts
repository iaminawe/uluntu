/**
 * Helper utility to handle null to undefined conversions for TypeScript
 */

/**
 * Converts null values to undefined, which is useful for optional properties
 * where TypeScript distinguishes between null and undefined
 */
export function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Safely ensures a boolean value is either boolean or undefined, not null
 */
export function safeBooleanOrUndefined(value: boolean | null | undefined): boolean | undefined {
  return nullToUndefined(value);
}
