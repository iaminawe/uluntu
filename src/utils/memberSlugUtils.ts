import { supabase } from '@/lib/supabase';

/**
 * Get member profile URL using slug if available, fallback to ID
 */
export function getMemberProfileUrl(member: { slug?: string | null; id: string }): string {
  return member.slug ? `/directory/${member.slug}` : `/directory/${member.id}`;
}

/**
 * Lookup member by slug or ID
 */
export async function lookupMember(identifier: string) {
  // First try as slug
  let { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('slug', identifier)
    .single();
  
  if (!error && data) {
    return { data, foundBy: 'slug' as const };
  }
  
  // If not found by slug, try as ID (UUID)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  if (isUuid) {
    const result = await supabase
      .from('members')
      .select('*')
      .eq('id', identifier)
      .single();
    
    if (!result.error && result.data) {
      return { data: result.data, foundBy: 'id' as const };
    }
  }
  
  return { data: null, foundBy: null };
}

/**
 * Generate a unique slug for a member
 */
export async function generateMemberSlug(name: string, excludeId?: string): Promise<string> {
  // Create base slug
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (!baseSlug) baseSlug = 'member';
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check uniqueness
  while (true) {
    const query = supabase
      .from('members')
      .select('id')
      .eq('slug', slug);
    
    if (excludeId) {
      query.neq('id', excludeId);
    }
    
    const { data } = await query;
    
    if (!data || data.length === 0) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}