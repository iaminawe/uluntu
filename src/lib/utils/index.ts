/**
 * Utility index file - exports common utilities
 * This file provides a clean interface for utility functions
 */

// Re-export from existing utilities for compatibility
export { generateSlug, ensureUniqueSlug, generateUniqueSlug } from '@/utils/slugify';
export { validateSlug, generateSlug as generateSlugSimple } from '@/utils/slugUtils';

// Import for internal use
import { validateSlug as validateSlugFn } from '@/utils/slugUtils';

// Basic content type definition
export type ContentType = 
  | 'members'
  | 'companies' 
  | 'events'
  | 'news'
  | 'opportunities'
  | 'groups'
  | 'resources'
  | 'marketplace'
  | 'pages'
  | 'topics';

// Basic slug options
export interface SlugOptions {
  lowercase?: boolean;
  separator?: string;
  strict?: boolean;
  maxLength?: number;
}

// Simple validation result
export interface SlugValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number;
}

// Stub implementations for compatibility
export const slugUtils = {
  news: {
    generate: (title: string) => generateSlug(title, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  companies: {
    generate: (name: string) => generateSlug(name, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  events: {
    generate: (title: string) => generateSlug(title, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  opportunities: {
    generate: (title: string) => generateSlug(title, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  members: {
    generate: (name: string) => generateSlug(name, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  groups: {
    generate: (name: string) => generateSlug(name, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  resources: {
    generate: (title: string) => generateSlug(title, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  marketplace: {
    generate: (title: string) => generateSlug(title, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  pages: {
    generate: (title: string) => generateSlug(title, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  },
  topics: {
    generate: (name: string) => generateSlug(name, { strict: true }),
    validate: (slug: string) => validateSlugFn(slug),
    lookup: () => Promise.resolve({ data: null, foundBy: null, error: 'Not implemented' })
  }
};

// Helper functions
function generateSlug(text: string, options: SlugOptions = {}): string {
  const { lowercase = true, separator = '-', strict = false } = options;
  
  let slug = text
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (strict) {
    slug = slug.replace(/[^a-z0-9-]/g, '');
  }

  return slug;
}