import { Database } from '../types/supabase';
import { Resource, ContentStatus } from '../types';

type SupabaseResource = Database['public']['Tables']['resources']['Row'];

export function adaptResourceFromDatabase(dbResource: SupabaseResource): Resource {
  // Get created_at with fallback for dateAdded property
  const createdAtDate = dbResource.created_at || new Date().toISOString();
  
  return {
    id: dbResource.id,
    title: dbResource.title,
    description: dbResource.description,
    type: (dbResource.type as 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link') || 'article',
    url: dbResource.url,
    image: dbResource.image ?? undefined,
    dateAdded: createdAtDate, // Ensure dateAdded is always present
    contributor: {
      id: dbResource.contributor_id,
      name: 'Contributor Name' // This should be populated from a join
    },
    groupId: dbResource.group_id ?? undefined,
    status: (dbResource.status as ContentStatus) ?? 'draft',
    featured: dbResource.featured === null ? false : !!dbResource.featured,
    created_at: createdAtDate
  };
}

export function adaptResourceToDatabase(resource: Partial<Resource>): Database['public']['Tables']['resources']['Insert'] { 
  // Return Insert type for database compatibility
  return {
    title: resource.title || '',
    description: resource.description || '',
    type: resource.type || 'article',
    url: resource.url || '',
    image: resource.image || null,
    contributor_id: resource.contributor?.id || '',
    group_id: resource.groupId || null,
    status: resource.status || 'draft',
    featured: resource.featured === undefined ? null : resource.featured
  };
}