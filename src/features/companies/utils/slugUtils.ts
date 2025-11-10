/**
 * Company-specific slug utilities - migrated to use universal slug system
 * @deprecated Consider using the universal slug utilities from @/lib/utils instead
 */

// Import from utilities
import { generateSlug as universalGenerateSlug } from '@/utils/slugify';

type ContentType = 'companies' | 'members' | 'events' | 'news' | 'opportunities';
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
  // Simple implementation for now
  const baseSlug = universalGenerateSlug(name, {
    strict: true,
    lowercase: true
  });

  // TODO(slug-uniqueness): Add database checking for slug uniqueness
  // Current implementation: Only generates base slug, no database lookup
  // To implement:
  //   1. Query Supabase for existing companies with same slug
  //   2. If not unique, append incrementing number (e.g., slug-1, slug-2)
  //   3. Exclude current company ID if updating
  //   4. Consider caching results with React Query
  // Note: Requires supabase client and database connection

  return baseSlug;
}

/**
 * Validate if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 * @deprecated Use validateSlugSEO from @/lib/utils for comprehensive validation
 */
export function isValidSlug(slug: string): boolean {
  logger.warn('Using deprecated company isValidSlug. Consider migrating to @/lib/utils', 'COMPANY_SLUG');
  // Simple validation
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
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
  // TODO(company-lookup): Implement database lookup function
  // Current status: Stub implementation - returns not implemented error
  // To implement:
  //   1. Determine if identifier is UUID or slug using parseCompanyParam()
  //   2. Query Supabase companies table:
  //      - By ID if UUID format
  //      - By slug field if slug format
  //   3. Return company data with foundBy metadata
  //   4. Handle errors gracefully
  // Related: parseCompanyParam, companiesApi
  // Estimated effort: 1 hour
  return { data: null, foundBy: null, error: 'Not implemented' };
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
  
  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const parsed = {
    type: uuidPattern.test(param) ? 'id' as const : 'slug' as const,
    value: param,
    confidence: uuidPattern.test(param) ? 'high' as const : 'medium' as const
  };
  
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
  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const parsed = {
    type: uuidPattern.test(param) ? 'id' as const : 'slug' as const,
    value: param,
    confidence: uuidPattern.test(param) ? 'high' as const : 'medium' as const
  };
  
  let isValid = false;
  let suggestions: string[] | undefined;
  
  if (parsed.type === 'id') {
    // UUID validation is handled in parseIdentifier
    isValid = parsed.confidence === 'high';
  } else {
    // Validate slug format
    // Simple slug validation
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    isValid = slugPattern.test(param);
    
    if (!isValid) {
      suggestions = [universalGenerateSlug(param)];
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
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      const isValid = slugPattern.test(slug);
      const score = isValid ? 80 : 40;
      const suggestions = !isValid 
        ? [universalGenerateSlug(name, { strict: true })] 
        : [];
      
      return {
        id,
        currentSlug: slug,
        isValid,
        score,
        suggestions,
        shouldUpdate: score < 70 // Update if score is low
      };
    });
  }
};

// Export enhanced utilities for direct use
export const companySlugUtils = {
  generate: generateUniqueCompanySlug,
  lookup: lookupCompany,
  parse: parseCompanyParamEnhanced,
  validate: (slug: string) => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return {
      isValid: slugPattern.test(slug),
      score: slugPattern.test(slug) ? 80 : 40,
      errors: [],
      warnings: [],
      suggestions: []
    };
  },
  migration: companySlugMigration
};