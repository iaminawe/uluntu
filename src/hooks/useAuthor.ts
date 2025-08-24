import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Author {
  id: string;
  name: string;
  slug?: string | null;
  image?: string | null;
  title?: string | null;
  user_id?: string | null;
  profileUrl?: string;
}

export type AuthorData = Author;

/**
 * Hook to fetch author information by user ID
 */
export function useAuthorByUserId(userId?: string | null) {
  return useQuery({
    queryKey: ['author', 'user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('members')
        .select('id, name, slug, image, title, user_id')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching author:', error);
        return null;
      }
      
      return data as Author;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch author information by member ID
 */
export function useAuthorByMemberId(memberId?: string | null) {
  return useQuery({
    queryKey: ['author', 'member', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      
      const { data, error } = await supabase
        .from('members')
        .select('id, name, slug, image, title, user_id')
        .eq('id', memberId)
        .single();
      
      if (error) {
        console.error('Error fetching author:', error);
        return null;
      }
      
      return data as Author;
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch author from content object
 * Supports multiple field names: author_id, user_id, created_by, posted_by
 */
export function useAuthorFromContent(content?: Record<string, unknown>) {
  const authorId = (content?.author_id || content?.user_id || content?.created_by || content?.posted_by) as string | undefined;
  
  // Determine if it's a user ID (from auth.users) or member ID
  const isUserId = authorId && authorId.length === 36; // UUID format
  const isMemberId = authorId && authorId.length !== 36;
  
  // Always call both hooks but conditionally enable them
  const userResult = useAuthorByUserId(isUserId ? authorId : undefined);
  const memberResult = useAuthorByMemberId(isMemberId ? authorId : undefined);
  
  if (isUserId && content?.members && typeof content.members === 'object' && 
      (content.members as Record<string, unknown>).id && 
      (content.members as Record<string, unknown>).name) {
    // If we already have member data embedded, use it
    return {
      data: content.members as Author,
      isLoading: false,
      error: null,
    };
  }
  
  // Return the appropriate result
  return isUserId ? userResult : memberResult;
}

/**
 * Format author display with fallback
 */
export function formatAuthorName(author?: Author | null | unknown, fallback = 'Unknown Author'): string {
  if (!author || typeof author !== 'object') return fallback;
  const authorObj = author as Record<string, unknown>;
  return typeof authorObj.name === 'string' ? authorObj.name : fallback;
}

/**
 * Get author profile URL
 */
export function getAuthorProfileUrl(author?: Author | null | unknown): string | null {
  if (!author || typeof author !== 'object') return null;
  const authorObj = author as Record<string, unknown>;
  // Prefer slug over id for SEO-friendly URLs
  if (typeof authorObj.slug === 'string' && authorObj.slug) {
    return `/directory/${authorObj.slug}`;
  } else if (typeof authorObj.id === 'string') {
    return `/directory/${authorObj.id}`;
  }
  return null;
}

/**
 * Get author by ID
 */
export function useAuthorById(authorId?: string | null) {
  return useAuthorByMemberId(authorId);
}

/**
 * Get multiple authors by IDs
 */
export function useAuthorsByIds(authorIds: string[]) {
  return useQuery({
    queryKey: ['authors', 'multiple', authorIds],
    queryFn: async () => {
      if (!authorIds.length) return [];
      
      const { data, error } = await supabase
        .from('members')
        .select('id, name, slug, image, title, user_id')
        .in('id', authorIds);
      
      if (error) {
        console.error('Error fetching authors:', error);
        return [];
      }
      
      return data as Author[];
    },
    enabled: authorIds.length > 0
  });
}