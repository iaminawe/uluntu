/**
 * Utility functions for generating and validating company slugs
 */

/**
 * Generate a URL-friendly slug from a company name
 * @param name - The company name to convert to a slug
 * @returns A kebab-case slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate if a slug is properly formatted
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with a hyphen
  // Should not contain consecutive hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Generate a unique slug by appending a number if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Extract company ID or slug from a route parameter
 * Determines if the parameter is a UUID or a slug
 * @param param - The route parameter (could be ID or slug)
 * @returns Object indicating type and value
 */
export function parseCompanyParam(param: string): { type: 'id' | 'slug'; value: string } {
  console.log('[parseCompanyParam] Parsing param:', param);
  
  // UUID v4 regex pattern - made more flexible to match any valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  const isUuid = uuidRegex.test(param);
  console.log('[parseCompanyParam] Is UUID?', isUuid, 'Regex test result:', uuidRegex.test(param));
  
  if (isUuid) {
    return { type: 'id', value: param };
  }
  
  return { type: 'slug', value: param };
}