import { supabase } from '../supabase';
import { logger } from '@/utils/logger';

/**
 * Content type mapping for database tables and their slug/title fields
 */
export const CONTENT_TYPE_CONFIG = {
  members: {
    table: 'members',
    slugField: 'slug',
    titleField: 'full_name',
    lookupFields: ['id', 'slug', 'full_name']
  },
  companies: {
    table: 'companies',
    slugField: 'slug',
    titleField: 'name',
    lookupFields: ['id', 'slug', 'name']
  },
  events: {
    table: 'events',
    slugField: 'slug',
    titleField: 'title',
    lookupFields: ['id', 'slug', 'title']
  },
  news: {
    table: 'news',
    slugField: 'slug',
    titleField: 'title',
    lookupFields: ['id', 'slug', 'title']
  },
  opportunities: {
    table: 'opportunities',
    slugField: 'slug',
    titleField: 'title',
    lookupFields: ['id', 'slug', 'title']
  },
  groups: {
    table: 'groups',
    slugField: 'slug',
    titleField: 'name',
    lookupFields: ['id', 'slug', 'name']
  },
  resources: {
    table: 'resources',
    slugField: 'slug',
    titleField: 'title',
    lookupFields: ['id', 'slug', 'title']
  },
  marketplace: {
    table: 'marketplace',
    slugField: 'slug',
    titleField: 'title',
    lookupFields: ['id', 'slug', 'title']
  },
  pages: {
    table: 'pages',
    slugField: 'slug',
    titleField: 'title',
    lookupFields: ['id', 'slug', 'title']
  },
  topics: {
    table: 'topics',
    slugField: 'slug',
    titleField: 'name',
    lookupFields: ['id', 'slug', 'name']
  }
} as const;

export type ContentType = keyof typeof CONTENT_TYPE_CONFIG;

/**
 * Slug generation options
 */
export interface SlugOptions {
  lowercase?: boolean;
  separator?: string;
  strict?: boolean;
  maxLength?: number;
  preserveUnicode?: boolean;
}

/**
 * Default slug options
 */
const DEFAULT_SLUG_OPTIONS: Required<SlugOptions> = {
  lowercase: true,
  separator: '-',
  strict: false,
  maxLength: 100,
  preserveUnicode: false
};

/**
 * In-memory cache for slug lookups
 */
class SlugCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

const slugCache = new SlugCache();

/**
 * Normalize unicode characters and handle international text
 */
function normalizeUnicode(text: string, preserveUnicode = false): string {
  if (preserveUnicode) {
    return text;
  }

  return text
    .normalize('NFD') // Normalize unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[ąćęłńóśźż]/g, (char) => {
      // Polish characters
      const map: Record<string, string> = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
      };
      return map[char] || char;
    })
    .replace(/[àáâãäåæ]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõöø]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[ß]/g, 'ss')
    .replace(/[ÿ]/g, 'y');
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(
  text: string,
  options: SlugOptions = {}
): string {
  const opts = { ...DEFAULT_SLUG_OPTIONS, ...options };
  
  if (!text || typeof text !== 'string') {
    logger.warn('Invalid text provided to generateSlug', 'SLUG', { text });
    return '';
  }

  let slug = text.trim();
  
  // Handle unicode normalization
  slug = normalizeUnicode(slug, opts.preserveUnicode);

  if (opts.lowercase) {
    slug = slug.toLowerCase();
  }

  if (opts.strict) {
    // Strict mode: only alphanumeric and separator
    slug = slug.replace(/[^a-zA-Z0-9\s]/g, ' ');
  } else {
    // Default: remove special characters but keep some safe ones
    slug = slug.replace(/[^a-zA-Z0-9\s\-_.]/g, ' ');
  }

  // Replace whitespace with separator
  slug = slug.replace(/\s+/g, opts.separator);
  
  // Replace multiple separators with single separator
  const separatorRegex = new RegExp(`\\${opts.separator}{2,}`, 'g');
  slug = slug.replace(separatorRegex, opts.separator);

  // Remove separator from start and end
  const trimRegex = new RegExp(`^\\${opts.separator}+|\\${opts.separator}+$`, 'g');
  slug = slug.replace(trimRegex, '');

  // Truncate if needed
  if (slug.length > opts.maxLength) {
    slug = slug.substring(0, opts.maxLength);
    // Remove trailing separator if truncation created one
    slug = slug.replace(new RegExp(`\\${opts.separator}+$`), '');
  }

  return slug;
}

/**
 * Validate if a slug meets formatting requirements
 */
export function validateSlug(
  slug: string,
  options: Pick<SlugOptions, 'separator' | 'strict'> = {}
): { isValid: boolean; errors: string[] } {
  const { separator = '-', strict = false } = options;
  const errors: string[] = [];

  if (!slug) {
    errors.push('Slug cannot be empty');
    return { isValid: false, errors };
  }

  if (typeof slug !== 'string') {
    errors.push('Slug must be a string');
    return { isValid: false, errors };
  }

  // Check length
  if (slug.length < 1) {
    errors.push('Slug is too short');
  }
  if (slug.length > 100) {
    errors.push('Slug is too long (max 100 characters)');
  }

  // Check for forbidden patterns
  if (slug.startsWith(separator) || slug.endsWith(separator)) {
    errors.push(`Slug cannot start or end with '${separator}'`);
  }

  if (slug.includes(separator + separator)) {
    errors.push(`Slug cannot contain consecutive '${separator}' characters`);
  }

  // Check character restrictions
  const allowedChars = strict 
    ? /^[a-z0-9\-]+$/
    : /^[a-zA-Z0-9\-_.]+$/;
    
  if (!allowedChars.test(slug)) {
    errors.push(strict 
      ? 'Slug can only contain lowercase letters, numbers, and hyphens'
      : 'Slug can only contain letters, numbers, hyphens, dots, and underscores'
    );
  }

  // Reserved words check
  const reservedWords = [
    'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'new', 'edit', 
    'create', 'delete', 'update', 'null', 'undefined', 'true', 'false'
  ];
  
  if (reservedWords.includes(slug.toLowerCase())) {
    errors.push(`'${slug}' is a reserved word and cannot be used as a slug`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Check if a slug exists in the database for a given content type
 */
export async function checkSlugExists(
  slug: string,
  contentType: ContentType,
  excludeId?: string
): Promise<boolean> {
  try {
    const config = CONTENT_TYPE_CONFIG[contentType];
    const cacheKey = `exists-${contentType}-${slug}-${excludeId || 'none'}`;
    
    // Check cache first
    const cached = slugCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    let query = supabase
      .from(config.table)
      .select('id')
      .eq(config.slugField, slug)
      .limit(1);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error checking slug existence', 'SLUG', { 
        slug, 
        contentType, 
        error: error.message 
      });
      return false;
    }

    const exists = (data && data.length > 0);
    
    // Cache the result
    slugCache.set(cacheKey, exists);
    
    return exists;
  } catch (error) {
    logger.error('Exception checking slug existence', 'SLUG', { 
      slug, 
      contentType, 
      error 
    });
    return false;
  }
}

/**
 * Generate a unique slug by appending numbers if necessary
 */
export async function generateUniqueSlug(
  text: string,
  contentType: ContentType,
  excludeId?: string,
  options: SlugOptions = {}
): Promise<string> {
  const baseSlug = generateSlug(text, options);
  
  if (!baseSlug) {
    throw new Error('Failed to generate base slug from text');
  }

  // Validate the base slug
  const validation = validateSlug(baseSlug, options);
  if (!validation.isValid) {
    logger.warn('Generated slug failed validation', 'SLUG', {
      slug: baseSlug,
      errors: validation.errors
    });
    // Try to fix common issues
    const fixedSlug = generateSlug(text, { ...options, strict: true });
    if (!fixedSlug) {
      throw new Error('Could not generate valid slug');
    }
  }

  let uniqueSlug = baseSlug;
  let counter = 1;
  const maxAttempts = 100; // Prevent infinite loops

  while (await checkSlugExists(uniqueSlug, contentType, excludeId)) {
    if (counter > maxAttempts) {
      throw new Error(`Could not generate unique slug after ${maxAttempts} attempts`);
    }
    
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  logger.debug('Generated unique slug', 'SLUG', {
    originalText: text,
    baseSlug,
    uniqueSlug,
    attempts: counter
  });

  return uniqueSlug;
}

/**
 * Look up content by ID or slug
 */
export async function lookupByIdOrSlug<T = any>(
  identifier: string,
  contentType: ContentType,
  selectFields?: string
): Promise<{ data: T | null; foundBy: 'id' | 'slug' | null; error?: string }> {
  try {
    const config = CONTENT_TYPE_CONFIG[contentType];
    const cacheKey = `lookup-${contentType}-${identifier}-${selectFields || 'default'}`;
    
    // Check cache first
    const cached = slugCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const fields = selectFields || config.lookupFields.join(',');
    
    // First try by ID (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(identifier)) {
      const { data, error } = await supabase
        .from(config.table)
        .select(fields)
        .eq('id', identifier)
        .single();
        
      if (data && !error) {
        const result = { data, foundBy: 'id' as const, error: undefined };
        slugCache.set(cacheKey, result);
        return result;
      }
    }
    
    // Then try by slug
    const { data, error } = await supabase
      .from(config.table)
      .select(fields)
      .eq(config.slugField, identifier)
      .single();
      
    if (data && !error) {
      const result = { data, foundBy: 'slug' as const, error: undefined };
      slugCache.set(cacheKey, result);
      return result;
    }
    
    // Not found
    const result = { 
      data: null, 
      foundBy: null, 
      error: error?.message || 'Content not found' 
    };
    slugCache.set(cacheKey, result);
    return result;
    
  } catch (error) {
    logger.error('Error in lookupByIdOrSlug', 'SLUG', {
      identifier,
      contentType,
      error
    });
    
    return {
      data: null,
      foundBy: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Determine if an identifier is likely an ID or slug
 */
export function parseIdentifier(identifier: string): { 
  type: 'id' | 'slug'; 
  value: string; 
  confidence: 'high' | 'medium' | 'low' 
} {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(identifier)) {
    return { type: 'id', value: identifier, confidence: 'high' };
  }
  
  // Check if it looks like a slug
  const slugValidation = validateSlug(identifier);
  if (slugValidation.isValid) {
    return { type: 'slug', value: identifier, confidence: 'high' };
  }
  
  // If it has slug-like characteristics but failed validation
  if (identifier.includes('-') || identifier.length > 10) {
    return { type: 'slug', value: identifier, confidence: 'medium' };
  }
  
  // Default to slug for short strings
  return { type: 'slug', value: identifier, confidence: 'low' };
}

/**
 * Bulk slug operations for better performance
 */
export async function generateMultipleSlugs(
  items: Array<{ text: string; id?: string }>,
  contentType: ContentType,
  options: SlugOptions = {}
): Promise<Array<{ originalText: string; slug: string; id?: string }>> {
  const results: Array<{ originalText: string; slug: string; id?: string }> = [];
  const existingSlugs = new Set<string>();
  
  // Get all existing slugs for this content type
  try {
    const config = CONTENT_TYPE_CONFIG[contentType];
    const { data } = await supabase
      .from(config.table)
      .select(`id, ${config.slugField}`);
      
    if (data) {
      data.forEach(item => {
        if (item[config.slugField]) {
          existingSlugs.add(item[config.slugField]);
        }
      });
    }
  } catch (error) {
    logger.error('Error fetching existing slugs', 'SLUG', { contentType, error });
  }
  
  // Generate slugs for each item
  for (const item of items) {
    const baseSlug = generateSlug(item.text, options);
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    // Exclude current item's slug if updating
    const shouldExclude = (slug: string) => {
      return existingSlugs.has(slug) && 
             !results.some(r => r.slug === slug && r.id !== item.id);
    };
    
    while (shouldExclude(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Add to our tracking set
    existingSlugs.add(uniqueSlug);
    
    results.push({
      originalText: item.text,
      slug: uniqueSlug,
      id: item.id
    });
  }
  
  return results;
}

/**
 * Cache management utilities
 */
export const slugCacheUtils = {
  /**
   * Clear all cached slug data
   */
  clearAll(): void {
    slugCache.invalidate();
    logger.debug('Cleared all slug cache', 'SLUG');
  },
  
  /**
   * Clear cache for specific content type
   */
  clearForContentType(contentType: ContentType): void {
    slugCache.invalidate(contentType);
    logger.debug('Cleared slug cache for content type', 'SLUG', { contentType });
  },
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; types: ContentType[] } {
    return {
      size: slugCache.size(),
      types: Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]
    };
  },
  
  /**
   * Preload frequently accessed slugs
   */
  async preloadSlugs(contentType: ContentType, limit = 100): Promise<void> {
    try {
      const config = CONTENT_TYPE_CONFIG[contentType];
      const { data } = await supabase
        .from(config.table)
        .select(config.lookupFields.join(','))
        .limit(limit);
        
      if (data) {
        data.forEach(item => {
          const cacheKey = `lookup-${contentType}-${item[config.slugField]}-default`;
          slugCache.set(cacheKey, {
            data: item,
            foundBy: 'slug',
            error: undefined
          });
        });
      }
      
      logger.debug('Preloaded slugs', 'SLUG', { contentType, count: data?.length || 0 });
    } catch (error) {
      logger.error('Error preloading slugs', 'SLUG', { contentType, error });
    }
  }
};