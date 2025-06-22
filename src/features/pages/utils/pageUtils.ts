import { Page, PageTreeNode } from '../types';

/**
 * Build a hierarchical tree structure from flat pages array
 */
export function buildPageTree(pages: Page[]): PageTreeNode[] {
  const pageMap = new Map<string, PageTreeNode>();
  const rootPages: PageTreeNode[] = [];

  // First pass: create all nodes
  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] });
  });

  // Second pass: build the tree
  pages.forEach(page => {
    const node = pageMap.get(page.id)!;
    
    if (!page.parent_id) {
      // Root page
      rootPages.push(node);
    } else {
      // Child page
      const parent = pageMap.get(page.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        rootPages.push(node);
      }
    }
  });

  // Sort by order
  const sortByOrder = (a: PageTreeNode, b: PageTreeNode) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  };

  rootPages.sort(sortByOrder);
  rootPages.forEach(page => {
    if (page.children) {
      page.children.sort(sortByOrder);
    }
  });

  return rootPages;
}

/**
 * Flatten a page tree into a flat array with depth information
 */
export function flattenPageTree(tree: PageTreeNode[], depth = 0): (PageTreeNode & { depth: number })[] {
  const result: (PageTreeNode & { depth: number })[] = [];

  tree.forEach(node => {
    result.push({ ...node, depth });
    
    if (node.children && node.children.length > 0) {
      result.push(...flattenPageTree(node.children, depth + 1));
    }
  });

  return result;
}

/**
 * Get the breadcrumb path for a page
 */
export function getPageBreadcrumbs(pageId: string, pages: Page[]): Page[] {
  const pageMap = new Map<string, Page>();
  pages.forEach(page => pageMap.set(page.id, page));

  const breadcrumbs: Page[] = [];
  let currentPage = pageMap.get(pageId);

  while (currentPage) {
    breadcrumbs.unshift(currentPage);
    currentPage = currentPage.parent_id ? pageMap.get(currentPage.parent_id) : undefined;
  }

  return breadcrumbs;
}

/**
 * Get all descendant pages of a given page
 */
export function getPageDescendants(pageId: string, pages: Page[]): Page[] {
  const descendants: Page[] = [];
  const children = pages.filter(page => page.parent_id === pageId);

  children.forEach(child => {
    descendants.push(child);
    descendants.push(...getPageDescendants(child.id, pages));
  });

  return descendants;
}

/**
 * Check if a page can be moved to a new parent (avoid circular references)
 */
export function canMovePageToParent(pageId: string, newParentId: string, pages: Page[]): boolean {
  if (pageId === newParentId) {
    return false; // Can't be parent of itself
  }

  const descendants = getPageDescendants(pageId, pages);
  return !descendants.some(descendant => descendant.id === newParentId);
}

/**
 * Generate a unique slug from a title
 */
export function generateUniqueSlug(title: string, existingPages: Page[], excludeId?: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (isSlugTaken(slug, existingPages, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Check if a slug is already taken by another page
 */
export function isSlugTaken(slug: string, pages: Page[], excludeId?: string): boolean {
  return pages.some(page => 
    page.slug === slug && page.id !== excludeId
  );
}

/**
 * Get page URL based on slug and hierarchy
 */
export function getPageUrl(page: Page, pages: Page[]): string {
  const breadcrumbs = getPageBreadcrumbs(page.id, pages);
  const slugs = breadcrumbs.map(p => p.slug).filter(Boolean);
  
  if (page.is_home) {
    return '/';
  }
  
  return `/${slugs.join('/')}`;
}

/**
 * Calculate reading time for page content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract plain text from HTML content
 */
export function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Generate meta description from content if not provided
 */
export function generateMetaDescription(content: string, maxLength = 160): string {
  const text = extractTextFromHtml(content);
  
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Validate page data
 */
export interface PageValidationError {
  field: string;
  message: string;
}

export function validatePage(page: Partial<Page>, existingPages: Page[] = []): PageValidationError[] {
  const errors: PageValidationError[] = [];

  // Required fields
  if (!page.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!page.content?.trim()) {
    errors.push({ field: 'content', message: 'Content is required' });
  }

  // Slug validation
  if (page.slug) {
    if (!/^[a-z0-9-]+$/.test(page.slug)) {
      errors.push({ field: 'slug', message: 'Slug can only contain lowercase letters, numbers, and hyphens' });
    }
    
    if (isSlugTaken(page.slug, existingPages, page.id)) {
      errors.push({ field: 'slug', message: 'This slug is already in use' });
    }
  }

  // Parent validation
  if (page.parent_id && page.id && !canMovePageToParent(page.id, page.parent_id, existingPages)) {
    errors.push({ field: 'parent_id', message: 'Invalid parent selection (would create circular reference)' });
  }

  // Home page validation
  if (page.is_home) {
    const existingHomePage = existingPages.find(p => p.is_home && p.id !== page.id);
    if (existingHomePage) {
      errors.push({ field: 'is_home', message: 'Another page is already set as the home page' });
    }
  }

  return errors;
}

/**
 * Sort pages by various criteria
 */
export type PageSortField = 'title' | 'created_at' | 'updated_at' | 'order' | 'status';
export type SortDirection = 'asc' | 'desc';

export function sortPages(
  pages: Page[], 
  field: PageSortField, 
  direction: SortDirection = 'asc'
): Page[] {
  return [...pages].sort((a, b) => {
    let aValue: any = a[field];
    let bValue: any = b[field];

    // Handle special cases
    if (field === 'order') {
      aValue = aValue ?? Number.MAX_SAFE_INTEGER;
      bValue = bValue ?? Number.MAX_SAFE_INTEGER;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    let result = 0;
    if (aValue < bValue) result = -1;
    else if (aValue > bValue) result = 1;

    return direction === 'desc' ? -result : result;
  });
}