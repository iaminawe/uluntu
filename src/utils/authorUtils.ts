import { AuthorData } from '../hooks/useAuthor';
import { Member } from '../types';

/**
 * Utility functions for working with author data
 */

/**
 * Convert a Member object to AuthorData format
 */
export function memberToAuthorData(member: Member): AuthorData {
  return {
    id: member.id,
    name: member.name,
    title: member.title,
    image: member.image || '/placeholder-avatar.png',
    profileUrl: `/directory/${member.id}`
  };
}

/**
 * Generate initials from author name for fallback avatars
 */
export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Generate a color for initials based on name
 */
export function generateAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
}

/**
 * Create a formatted author display string
 */
export function formatAuthorDisplay(
  author: AuthorData, 
  options: { includeTitle?: boolean; separator?: string } = {}
): string {
  const { includeTitle = false, separator = ' - ' } = options;
  
  if (includeTitle && author.title) {
    return `${author.name}${separator}${author.title}`;
  }
  
  return author.name;
}

/**
 * Validate author data completeness
 */
export function validateAuthorData(author: Partial<AuthorData>): author is AuthorData {
  return !!(
    author.id &&
    author.name &&
    author.profileUrl
  );
}

/**
 * Sort authors by name, handling edge cases
 */
export function sortAuthorsByName(authors: AuthorData[]): AuthorData[] {
  return [...authors].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Filter authors by search term
 */
export function filterAuthors(
  authors: AuthorData[], 
  searchTerm: string
): AuthorData[] {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) return authors;
  
  return authors.filter(author => 
    author.name.toLowerCase().includes(term) ||
    (author.title && author.title.toLowerCase().includes(term))
  );
}

/**
 * Group authors by first letter of their name
 */
export function groupAuthorsByInitial(authors: AuthorData[]): Record<string, AuthorData[]> {
  return authors.reduce((groups, author) => {
    const initial = author.name.charAt(0).toUpperCase();
    if (!groups[initial]) {
      groups[initial] = [];
    }
    groups[initial].push(author);
    return groups;
  }, {} as Record<string, AuthorData[]>);
}

/**
 * Create a cache key for author queries
 */
export function createAuthorCacheKey(
  type: 'single' | 'batch', 
  ids: string | string[]
): string {
  if (type === 'single') {
    return `author:${ids}`;
  }
  
  const sortedIds = Array.isArray(ids) ? ids.sort().join(',') : ids;
  return `authors:batch:${sortedIds}`;
}

/**
 * Extract unique author IDs from a list of content items
 */
export function extractUniqueAuthorIds(
  contentItems: Record<string, any>[]
): string[] {
  const authorIds = new Set<string>();
  
  contentItems.forEach(item => {
    const authorId = extractAuthorIdFromContent(item);
    if (authorId) {
      authorIds.add(authorId);
    }
  });
  
  return Array.from(authorIds);
}

/**
 * Extract author ID from content using common field patterns
 */
function extractAuthorIdFromContent(content: Record<string, any>): string | undefined {
  return (
    content.authorId ||
    content.author_id ||
    content.memberId ||
    content.member_id ||
    content.userId ||
    content.user_id ||
    content.createdBy ||
    content.created_by
  );
}