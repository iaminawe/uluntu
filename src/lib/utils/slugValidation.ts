import { SlugOptions } from './slugUtils';
import { logger } from '@/utils/logger';

/**
 * Comprehensive slug validation with detailed error reporting
 */
export interface SlugValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100, higher is better
}

/**
 * SEO-friendly slug requirements
 */
export interface SEOSlugRequirements {
  minLength: number;
  maxLength: number;
  preferredLength: number;
  allowNumbers: boolean;
  requireLetters: boolean;
  separator: string;
  forbiddenPatterns: RegExp[];
  reservedWords: string[];
}

/**
 * Default SEO requirements for slugs
 */
const DEFAULT_SEO_REQUIREMENTS: SEOSlugRequirements = {
  minLength: 3,
  maxLength: 60,
  preferredLength: 30,
  allowNumbers: true,
  requireLetters: true,
  separator: '-',
  forbiddenPatterns: [
    /^\d+$/, // All numbers
    /^-/, // Starts with separator
    /-$/, // Ends with separator
    /--+/, // Multiple consecutive separators
    /[A-Z]/, // Uppercase letters (should be lowercase)
    /[^a-z0-9-]/ // Invalid characters
  ],
  reservedWords: [
    // System/technical words
    'admin', 'api', 'app', 'www', 'mail', 'ftp', 'ssh', 'ssl',
    'localhost', 'cdn', 'static', 'assets', 'public', 'private',
    
    // CRUD operations
    'new', 'edit', 'create', 'update', 'delete', 'remove', 'add',
    'view', 'show', 'list', 'index', 'search', 'filter',
    
    // Programming keywords
    'null', 'undefined', 'true', 'false', 'void', 'return',
    'function', 'class', 'const', 'let', 'var', 'if', 'else',
    
    // HTTP methods
    'get', 'post', 'put', 'patch', 'delete', 'head', 'options',
    
    // Common paths
    'home', 'about', 'contact', 'privacy', 'terms', 'help',
    'support', 'login', 'logout', 'signin', 'signup', 'register',
    'profile', 'settings', 'dashboard', 'account', 'user', 'users',
    
    // File extensions
    'html', 'css', 'js', 'json', 'xml', 'txt', 'pdf', 'doc',
    'jpg', 'png', 'gif', 'svg', 'ico', 'zip', 'tar', 'gz'
  ]
};

/**
 * Validate a slug against SEO best practices
 */
export function validateSlugSEO(
  slug: string,
  requirements: Partial<SEOSlugRequirements> = {}
): SlugValidationResult {
  const reqs = { ...DEFAULT_SEO_REQUIREMENTS, ...requirements };
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Basic validation
  if (!slug || typeof slug !== 'string') {
    return {
      isValid: false,
      errors: ['Slug must be a non-empty string'],
      warnings: [],
      suggestions: ['Provide a valid text string to generate a slug'],
      score: 0
    };
  }

  const trimmedSlug = slug.trim();
  if (trimmedSlug !== slug) {
    errors.push('Slug cannot have leading or trailing whitespace');
    suggestions.push('Remove whitespace from the beginning and end');
    score -= 10;
  }

  // Length validation
  if (slug.length < reqs.minLength) {
    errors.push(`Slug is too short (minimum ${reqs.minLength} characters)`);
    suggestions.push(`Make the slug at least ${reqs.minLength} characters long`);
    score -= 20;
  }

  if (slug.length > reqs.maxLength) {
    errors.push(`Slug is too long (maximum ${reqs.maxLength} characters)`);
    suggestions.push(`Shorten the slug to ${reqs.maxLength} characters or less`);
    score -= 15;
  }

  if (slug.length > reqs.preferredLength) {
    warnings.push(`Slug is longer than preferred length (${reqs.preferredLength} characters)`);
    suggestions.push(`Consider shortening to ${reqs.preferredLength} characters for better SEO`);
    score -= 5;
  }

  // Character validation
  if (reqs.requireLetters && !/[a-z]/.test(slug)) {
    errors.push('Slug must contain at least one letter');
    suggestions.push('Add descriptive words with letters');
    score -= 25;
  }

  if (!reqs.allowNumbers && /\d/.test(slug)) {
    warnings.push('Slug contains numbers which may impact SEO');
    suggestions.push('Consider replacing numbers with words when possible');
    score -= 5;
  }

  // Pattern validation
  reqs.forbiddenPatterns.forEach((pattern, index) => {
    if (pattern.test(slug)) {
      switch (index) {
        case 0: // All numbers
          errors.push('Slug cannot contain only numbers');
          suggestions.push('Add descriptive words to the slug');
          score -= 30;
          break;
        case 1: // Starts with separator
          errors.push(`Slug cannot start with '${reqs.separator}'`);
          suggestions.push(`Remove '${reqs.separator}' from the beginning`);
          score -= 15;
          break;
        case 2: // Ends with separator
          errors.push(`Slug cannot end with '${reqs.separator}'`);
          suggestions.push(`Remove '${reqs.separator}' from the end`);
          score -= 15;
          break;
        case 3: // Multiple separators
          errors.push(`Slug cannot contain multiple consecutive '${reqs.separator}' characters`);
          suggestions.push(`Replace multiple '${reqs.separator}' with single '${reqs.separator}'`);
          score -= 10;
          break;
        case 4: // Uppercase
          errors.push('Slug must be lowercase');
          suggestions.push('Convert all letters to lowercase');
          score -= 10;
          break;
        case 5: // Invalid characters
          errors.push('Slug contains invalid characters');
          suggestions.push(`Only use lowercase letters, numbers, and '${reqs.separator}'`);
          score -= 20;
          break;
      }
    }
  });

  // Reserved words check
  const slugWords = slug.split(reqs.separator);
  const foundReservedWords = slugWords.filter(word => 
    reqs.reservedWords.includes(word.toLowerCase())
  );
  
  if (foundReservedWords.length > 0) {
    errors.push(`Slug contains reserved words: ${foundReservedWords.join(', ')}`);
    suggestions.push('Replace reserved words with more descriptive alternatives');
    score -= foundReservedWords.length * 10;
  }

  // SEO quality checks
  if (slug.split(reqs.separator).length > 6) {
    warnings.push('Slug has many words which may dilute SEO value');
    suggestions.push('Consider using fewer, more impactful words');
    score -= 5;
  }

  // Check for repetitive words
  const wordCounts = slug.split(reqs.separator).reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const repeatedWords = Object.entries(wordCounts)
    .filter(([_, count]) => count > 1)
    .map(([word]) => word);
    
  if (repeatedWords.length > 0) {
    warnings.push(`Slug contains repeated words: ${repeatedWords.join(', ')}`);
    suggestions.push('Remove duplicate words for cleaner URLs');
    score -= repeatedWords.length * 5;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    score
  };
}

/**
 * Auto-fix common slug issues
 */
export function autoFixSlug(
  slug: string,
  requirements: Partial<SEOSlugRequirements> = {}
): { fixedSlug: string; changesApplied: string[] } {
  const reqs = { ...DEFAULT_SEO_REQUIREMENTS, ...requirements };
  const changesApplied: string[] = [];
  let fixedSlug = slug;

  if (!slug || typeof slug !== 'string') {
    return { fixedSlug: '', changesApplied: ['Invalid input provided'] };
  }

  // Trim whitespace
  if (fixedSlug !== fixedSlug.trim()) {
    fixedSlug = fixedSlug.trim();
    changesApplied.push('Removed leading/trailing whitespace');
  }

  // Convert to lowercase
  if (fixedSlug !== fixedSlug.toLowerCase()) {
    fixedSlug = fixedSlug.toLowerCase();
    changesApplied.push('Converted to lowercase');
  }

  // Replace invalid characters with separator
  const validCharPattern = new RegExp(`[^a-z0-9${reqs.separator}]`, 'g');
  if (validCharPattern.test(fixedSlug)) {
    fixedSlug = fixedSlug.replace(validCharPattern, reqs.separator);
    changesApplied.push('Replaced invalid characters');
  }

  // Fix multiple consecutive separators
  const multipleSeparatorPattern = new RegExp(`${reqs.separator}{2,}`, 'g');
  if (multipleSeparatorPattern.test(fixedSlug)) {
    fixedSlug = fixedSlug.replace(multipleSeparatorPattern, reqs.separator);
    changesApplied.push('Collapsed multiple separators');
  }

  // Remove separators from start and end
  const trimSeparatorPattern = new RegExp(`^${reqs.separator}+|${reqs.separator}+$`, 'g');
  if (trimSeparatorPattern.test(fixedSlug)) {
    fixedSlug = fixedSlug.replace(trimSeparatorPattern, '');
    changesApplied.push('Removed leading/trailing separators');
  }

  // Handle reserved words by appending content type or number
  const slugWords = fixedSlug.split(reqs.separator);
  let hasReservedWords = false;
  
  for (let i = 0; i < slugWords.length; i++) {
    if (reqs.reservedWords.includes(slugWords[i])) {
      slugWords[i] = `${slugWords[i]}-item`;
      hasReservedWords = true;
    }
  }
  
  if (hasReservedWords) {
    fixedSlug = slugWords.join(reqs.separator);
    changesApplied.push('Modified reserved words');
  }

  // Truncate if too long
  if (fixedSlug.length > reqs.maxLength) {
    // Try to truncate at word boundary
    const words = fixedSlug.split(reqs.separator);
    let truncated = '';
    
    for (const word of words) {
      const potential = truncated ? `${truncated}${reqs.separator}${word}` : word;
      if (potential.length <= reqs.maxLength) {
        truncated = potential;
      } else {
        break;
      }
    }
    
    if (truncated && truncated !== fixedSlug) {
      fixedSlug = truncated;
      changesApplied.push(`Truncated to ${reqs.maxLength} characters`);
    }
  }

  // Final validation to ensure minimum length
  if (fixedSlug.length < reqs.minLength) {
    if (fixedSlug) {
      fixedSlug = `${fixedSlug}${reqs.separator}item`;
      changesApplied.push('Added suffix to meet minimum length');
    } else {
      fixedSlug = 'item';
      changesApplied.push('Generated fallback slug');
    }
  }

  return { fixedSlug, changesApplied };
}

/**
 * Generate SEO-optimized slug suggestions
 */
export function generateSlugSuggestions(
  text: string,
  count = 3,
  options: SlugOptions = {}
): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const suggestions: string[] = [];
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  if (words.length === 0) {
    return [];
  }

  // Strategy 1: Use all words
  if (words.length <= 5) {
    suggestions.push(words.join('-'));
  }

  // Strategy 2: Use first N words
  if (words.length > 2) {
    suggestions.push(words.slice(0, 3).join('-'));
  }

  // Strategy 3: Use important words (longer than 3 chars)
  const importantWords = words.filter(word => word.length > 3);
  if (importantWords.length > 0 && importantWords.length !== words.length) {
    suggestions.push(importantWords.slice(0, 4).join('-'));
  }

  // Strategy 4: Abbreviate long words
  if (words.some(word => word.length > 8)) {
    const abbreviatedWords = words.map(word => 
      word.length > 8 ? word.substring(0, 6) : word
    );
    suggestions.push(abbreviatedWords.slice(0, 4).join('-'));
  }

  // Strategy 5: Use first and last words if many words
  if (words.length > 4) {
    suggestions.push([words[0], words[words.length - 1]].join('-'));
  }

  // Remove duplicates and validate
  const uniqueSuggestions = [...new Set(suggestions)]
    .filter(slug => {
      const validation = validateSlugSEO(slug);
      return validation.isValid || validation.score > 50;
    })
    .slice(0, count);

  // If no valid suggestions, try auto-fix on the first attempt
  if (uniqueSuggestions.length === 0 && suggestions.length > 0) {
    const { fixedSlug } = autoFixSlug(suggestions[0]);
    if (fixedSlug) {
      uniqueSuggestions.push(fixedSlug);
    }
  }

  return uniqueSuggestions;
}

/**
 * Validate slug in real-time for forms
 */
export function validateSlugRealtime(
  slug: string,
  debounceMs = 300
): Promise<SlugValidationResult> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(validateSlugSEO(slug));
    }, debounceMs);

    // Store timer for potential cleanup
    (validateSlugRealtime as any).timer = timer;
  });
}

/**
 * Batch validate multiple slugs
 */
export function validateMultipleSlugs(
  slugs: string[],
  requirements: Partial<SEOSlugRequirements> = {}
): Map<string, SlugValidationResult> {
  const results = new Map<string, SlugValidationResult>();
  
  slugs.forEach(slug => {
    try {
      results.set(slug, validateSlugSEO(slug, requirements));
    } catch (error) {
      logger.error('Error validating slug', 'SLUG_VALIDATION', { slug, error });
      results.set(slug, {
        isValid: false,
        errors: ['Validation failed due to error'],
        warnings: [],
        suggestions: [],
        score: 0
      });
    }
  });
  
  return results;
}

/**
 * Export validation utilities
 */
export const slugValidationUtils = {
  validateSlugSEO,
  autoFixSlug,
  generateSlugSuggestions,
  validateSlugRealtime,
  validateMultipleSlugs,
  DEFAULT_SEO_REQUIREMENTS
};