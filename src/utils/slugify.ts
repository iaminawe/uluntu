/**
 * Legacy slug utilities - kept for backward compatibility
 */

import { logger } from './logger';

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(
  text: string,
  options: {
    lowercase?: boolean;
    separator?: string;
    strict?: boolean;
  } = {}
): string {
  const {
    lowercase = true,
    separator = '-',
    strict = false
  } = options;

  let slug = text
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, separator) // Replace spaces, underscores, hyphens with separator
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), ''); // Remove leading/trailing separators

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (strict) {
    slug = slug.replace(/[^a-z0-9-]/g, '');
  }

  return slug;
}

/**
 * Ensure a slug is unique by appending a number if necessary
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Generate a unique slug from title
 */
export function generateUniqueSlug(
  title: string,
  existingSlugs: string[] = [],
  options?: Parameters<typeof generateSlug>[1]
): string {
  const baseSlug = generateSlug(title, options);
  return ensureUniqueSlug(baseSlug, existingSlugs);
}