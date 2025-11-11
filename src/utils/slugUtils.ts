/**
 * Slug utilities for generating URL-friendly identifiers
 */

import { logger } from './logger';

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate if a string is a valid slug
 */
export function validateSlug(slug: string): { isValid: boolean } {
  // Check if slug matches the pattern: lowercase letters, numbers, and hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return { isValid: slugPattern.test(slug) };
}

/**
 * Check if a slug is valid (boolean return)
 */
export function isValidSlug(slug: string): boolean {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

/**
 * Make a slug unique by appending a number if it already exists
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  // Keep trying until we find a unique slug
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Parse a company parameter to determine if it's an ID or slug
 * Returns the type and value for proper routing
 */
export function parseCompanyParam(param: string): { type: 'id' | 'slug'; value: string } {
  // UUID pattern (8-4-4-4-12 format)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidPattern.test(param)) {
    logger.debug('Parsed param as UUID', 'SLUG_UTILS', { param });
    return { type: 'id', value: param };
  }

  logger.debug('Parsed param as slug', 'SLUG_UTILS', { param });
  return { type: 'slug', value: param };
}