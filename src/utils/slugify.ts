/**
 * Generate a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @param options Configuration options
 * @returns A URL-friendly slug
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
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace spaces and non-alphanumeric characters with separator
  if (strict) {
    // Strict mode: only allow alphanumeric characters
    slug = slug.replace(/[^a-zA-Z0-9]+/g, separator);
  } else {
    // Default: allow alphanumeric, hyphens, and underscores
    slug = slug.replace(/[^a-zA-Z0-9-_]+/g, separator);
  }

  // Remove multiple separators
  slug = slug.replace(new RegExp(`${separator}{2,}`, 'g'), separator);

  // Remove separator from start and end
  slug = slug.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  return slug;
}

/**
 * Ensure a slug is unique by appending a number if necessary
 * @param baseSlug The base slug to make unique
 * @param existingSlugs Array of existing slugs to check against
 * @returns A unique slug
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
 * Generate a slug from a title with uniqueness check
 * @param title The title to convert to a slug
 * @param existingSlugs Array of existing slugs
 * @param options Slug generation options
 * @returns A unique slug
 */
export function generateUniqueSlug(
  title: string,
  existingSlugs: string[] = [],
  options?: Parameters<typeof generateSlug>[1]
): string {
  const baseSlug = generateSlug(title, options);
  return ensureUniqueSlug(baseSlug, existingSlugs);
}