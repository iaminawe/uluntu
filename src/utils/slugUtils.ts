/**
 * Legacy slug utilities - kept for backward compatibility
 * @deprecated Use the new utilities in /lib/utils/slugUtils.ts instead
 */

import { generateSlug as newGenerateSlug, validateSlug as newValidateSlug } from '../lib/utils/slugUtils';
import { logger } from './logger';

/**
 * @deprecated Use generateSlug from /lib/utils/slugUtils.ts
 */
export function generateSlug(text: string): string {
  logger.warn('Using deprecated generateSlug. Please use the new version from /lib/utils/slugUtils.ts', 'SLUG_LEGACY');
  return newGenerateSlug(text, { strict: true });
}

/**
 * @deprecated Use validateSlug from /lib/utils/slugUtils.ts
 */
export function validateSlug(slug: string): boolean {
  logger.warn('Using deprecated validateSlug. Please use the new version from /lib/utils/slugUtils.ts', 'SLUG_LEGACY');
  const validation = newValidateSlug(slug);
  return validation.isValid;
}