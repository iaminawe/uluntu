/**
 * Company-specific slug utilities - migrated to use universal slug system
 * @deprecated Consider using the universal slug utilities from @/lib/utils instead
 */

import { 
  generateSlug as universalGenerateSlug,
  generateUniqueSlug,
  validateSlugSEO,
  parseIdentifier,
  lookupByIdOrSlug,
  type ContentType
} from '@/lib/utils';
import { logger } from '@/utils/logger';

const CONTENT_TYPE: ContentType = 'companies';

/**
 * Generate a URL-friendly slug from a company name
 * @param name - The company name to convert to a slug
 * @returns A kebab-case slug
 * @deprecated Use generateUniqueSlug from @/lib/utils for database-backed uniqueness
 */
export function generateSlug(name: string): string {
  logger.warn('Using deprecated company generateSlug. Consider migrating to @/lib/utils', 'COMPANY_SLUG');
  return universalGenerateSlug(name, {
    strict: true,
    maxLength: 60,
    lowercase: true
  });
}

/**
 * Generate a unique company slug with database checking
 * @param name - The company name to convert to a slug
 * @param excludeId - ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 */
export async function generateUniqueCompanySlug(
  name: string,
  excludeId?: string
): Promise<string> {
  return generateUniqueSlug(name, CONTENT_TYPE, excludeId, {
    strict: true,
    maxLength: 60,
    lowercase: true
  });
}

/**
 * Validate if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 * @deprecated Use validateSlugSEO from @/lib/utils for comprehensive validation
 */
export function isValidSlug(slug: string): boolean {
  logger.warn('Using deprecated company isValidSlug. Consider migrating to @/lib/utils', 'COMPANY_SLUG');
  const validation = validateSlugSEO(slug);
  return validation.isValid;
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 * @deprecated Use generateUniqueSlug with database checking instead
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  logger.warn('Using deprecated makeSlugUnique with array checking. Consider database-backed uniqueness', 'COMPANY_SLUG');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Look up a company by ID or slug
 * @param identifier - The company ID or slug
 * @param selectFields - Optional fields to select
 * @returns Company data with lookup metadata
 */
export async function lookupCompany<T = any>(
  identifier: string,
  selectFields?: string
): Promise<{ data: T | null; foundBy: 'id' | 'slug' | null; error?: string }> {
  return lookupByIdOrSlug<T>(identifier, CONTENT_TYPE, selectFields);
}

/**
 * Extract company ID or slug from a route parameter
 * Determines if the parameter is a UUID or a slug
 * @param param - The route parameter (could be ID or slug)
 * @returns Object indicating type and value
 */
export function parseCompanyParam(param: string): { 
  type: 'id' | 'slug'; 
  value: string; 
  confidence: 'high' | 'medium' | 'low' 
} {
  logger.debug('Parsing company parameter', 'COMPANY_SLUG', { param });
  
  const parsed = parseIdentifier(param);
  
  logger.debug('Company parameter parsed', 'COMPANY_SLUG', {
    param,
    type: parsed.type,
    confidence: parsed.confidence
  });
  
  return parsed;
}

/**
 * Enhanced company parameter parsing with validation
 * @param param - The route parameter
 * @returns Detailed parsing result with validation
 */
export function parseCompanyParamEnhanced(param: string): {
  type: 'id' | 'slug';
  value: string;
  confidence: 'high' | 'medium' | 'low';
  isValid: boolean;
  suggestions?: string[];
} {
  const parsed = parseIdentifier(param);
  
  let isValid = false;
  let suggestions: string[] | undefined;
  
  if (parsed.type === 'id') {
    // UUID validation is handled in parseIdentifier
    isValid = parsed.confidence === 'high';
  } else {
    // Validate slug format
    const validation = validateSlugSEO(param);
    isValid = validation.isValid;
    
    if (!isValid && validation.suggestions.length > 0) {
      suggestions = validation.suggestions;
    }
  }
  
  return {
    ...parsed,
    isValid,
    suggestions
  };
}

/**
 * Migration helper for existing company slug operations
 */
export const companySlugMigration = {
  /**
   * Migrate from array-based to database-based uniqueness checking
   */
  async migrateToDatabase(
    companyName: string,
    existingSlugs: string[],
    companyId?: string
  ): Promise<{ oldMethod: string; newMethod: string; shouldUpdate: boolean }> {
    // Old method result
    const baseSlug = generateSlug(companyName);
    const oldMethod = makeSlugUnique(baseSlug, existingSlugs);
    
    // New method result
    const newMethod = await generateUniqueCompanySlug(companyName, companyId);
    
    return {
      oldMethod,
      newMethod,
      shouldUpdate: oldMethod !== newMethod
    };
  },
  
  /**
   * Validate existing company slugs and suggest improvements
   */
  validateExistingSlugs(
    slugs: Array<{ id: string; slug: string; name: string }>
  ): Array<{ 
    id: string; 
    currentSlug: string; 
    isValid: boolean; 
    score: number;
    suggestions: string[];
    shouldUpdate: boolean;
  }> {
    return slugs.map(({ id, slug, name }) => {
      const validation = validateSlugSEO(slug);
      const suggestions = validation.suggestions.length > 0 
        ? validation.suggestions 
        : [universalGenerateSlug(name, { strict: true, maxLength: 60 })];
      
      return {
        id,
        currentSlug: slug,
        isValid: validation.isValid,
        score: validation.score,
        suggestions,
        shouldUpdate: validation.score < 70 // Update if score is low
      };
    });
  }
};

// Export enhanced utilities for direct use
export const companySlugUtils = {
  generate: generateUniqueCompanySlug,
  lookup: lookupCompany,
  parse: parseCompanyParamEnhanced,
  validate: (slug: string) => validateSlugSEO(slug),
  migration: companySlugMigration
};