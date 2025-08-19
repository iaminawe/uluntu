/**
 * Legacy slug utilities - kept for backward compatibility
 * @deprecated Use the comprehensive utilities in /lib/utils/slugUtils.ts instead
 */

import { 
  generateSlug as newGenerateSlug, 
  generateUniqueSlug as newGenerateUniqueSlug,
  type SlugOptions,
  type ContentType
} from '../lib/utils/slugUtils';
import { logger } from './logger';

/**
 * @deprecated Use generateSlug from /lib/utils/slugUtils.ts
 */
export function generateSlug(
  text: string,
  options: {
    lowercase?: boolean;
    separator?: string;
    strict?: boolean;
  } = {}
): string {
  logger.warn('Using deprecated generateSlug. Please migrate to /lib/utils/slugUtils.ts', 'SLUG_LEGACY');
  
  const newOptions: SlugOptions = {
    lowercase: options.lowercase,
    separator: options.separator,
    strict: options.strict
  };
  
  return newGenerateSlug(text, newOptions);
}

/**
 * @deprecated Use generateUniqueSlug from /lib/utils/slugUtils.ts with database checking
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  logger.warn('Using deprecated ensureUniqueSlug. Please migrate to /lib/utils/slugUtils.ts', 'SLUG_LEGACY');
  
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
 * @deprecated Use generateUniqueSlug from /lib/utils/slugUtils.ts with database checking
 */
export function generateUniqueSlug(
  title: string,
  existingSlugs: string[] = [],
  options?: Parameters<typeof generateSlug>[1]
): string {
  logger.warn('Using deprecated generateUniqueSlug. Please migrate to /lib/utils/slugUtils.ts', 'SLUG_LEGACY');
  
  const baseSlug = generateSlug(title, options);
  return ensureUniqueSlug(baseSlug, existingSlugs);
}

/**
 * Migration helper - provides guidance for updating to new slug utilities
 */
export const slugMigrationGuide = {
  generateSlug: 'Replace with: import { generateSlug } from "@/lib/utils/slugUtils"',
  ensureUniqueSlug: 'Replace with: import { generateUniqueSlug } from "@/lib/utils/slugUtils" and specify contentType',
  generateUniqueSlug: 'Replace with: import { generateUniqueSlug } from "@/lib/utils/slugUtils" and specify contentType',
  validation: 'Use: import { validateSlugSEO } from "@/lib/utils/slugValidation" for advanced validation',
  lookup: 'Use: import { lookupByIdOrSlug } from "@/lib/utils/slugUtils" for database lookups',
  hooks: 'Use: import { useSlugGeneration } from "@/lib/utils/slugHooks" for React components'
};