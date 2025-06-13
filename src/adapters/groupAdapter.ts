import { Database } from '../types/supabase';
import { 
  Group as FrontendGroup
} from '../types';
import { ContentStatus } from '../types/common';

// Define input types for insert and update
export type GroupInsertData = Pick<FrontendGroup, 'name' | 'description' | 'visibility' | 'heroImage'> & 
  Partial<Pick<FrontendGroup, 'longDescription' | 'coverImage' | 'status' | 'featured' | 'created_at'>>;

export type GroupUpdateData = Partial<GroupInsertData> & Pick<FrontendGroup, 'id'>; // id is needed for update, others optional

type SupabaseGroupRow = Database['public']['Tables']['groups']['Row'] & { interests?: string[] };
type SupabaseGroupInsert = Database['public']['Tables']['groups']['Insert'];
type SupabaseGroupUpdate = Database['public']['Tables']['groups']['Update'];

export function adaptGroupFromDatabase(group: SupabaseGroupRow): FrontendGroup {
  return {
    // BaseEntity properties
    id: group.id,
    status: group.status as ContentStatus ?? 'draft',
    featured: group.featured ?? false,
    created_at: group.created_at,

    // Group specific properties
    name: group.name,
    description: group.description,
    longDescription: group.long_description ?? undefined,
    heroImage: group.hero_image ?? '',
    coverImage: group.cover_image ?? group.hero_image ?? undefined,
    visibility: group.visibility as FrontendGroup['visibility'] ?? 'open',
    
    // These counts and arrays are typically not part of the base SupabaseGroupRow.
    // They should be populated by more specific queries or API logic if needed.
    // Defaulting to 0 or empty arrays here for counts not directly on the 'groups' table row.
    // These are typically derived from related tables or specific queries.
    memberCount: group.member_count ?? 0, // 'member_count' is a direct column
    eventCount: 0,
    resourceCount: 0,
    postCount: 0,
    
    lastActive: group.created_at ?? new Date().toISOString(), // 'last_active' and 'updated_at' are not direct columns on the base 'groups' row

    members: [],
    events: [],
    resources: [],
    posts: [],
    interests: group.interests || [],
  };
}

export function adaptGroupToSupabaseInsert(groupData: GroupInsertData): SupabaseGroupInsert {
  const insertPayload: SupabaseGroupInsert = {
    name: groupData.name,
    description: groupData.description,
    visibility: groupData.visibility,
    hero_image: groupData.heroImage, // Now required
  };

  if (groupData.longDescription !== undefined) insertPayload.long_description = groupData.longDescription;
  // hero_image is already handled as required
  if (groupData.coverImage !== undefined) insertPayload.cover_image = groupData.coverImage;
  if (groupData.status !== undefined) insertPayload.status = groupData.status; // Assumes Supabase 'status' column is string compatible
  if (groupData.featured !== undefined) insertPayload.featured = groupData.featured;
  if (groupData.created_at !== undefined) insertPayload.created_at = groupData.created_at;
  
  return insertPayload;
}

export function adaptGroupToSupabaseUpdate(groupData: GroupUpdateData): SupabaseGroupUpdate {
  const updatePayload: SupabaseGroupUpdate = {};

  if (groupData.name !== undefined) updatePayload.name = groupData.name;
  if (groupData.description !== undefined) updatePayload.description = groupData.description;
  if (groupData.longDescription !== undefined) updatePayload.long_description = groupData.longDescription;
  if (groupData.heroImage !== undefined) updatePayload.hero_image = groupData.heroImage;
  if (groupData.coverImage !== undefined) updatePayload.cover_image = groupData.coverImage;
  if (groupData.visibility !== undefined) updatePayload.visibility = groupData.visibility;
  if (groupData.status !== undefined) updatePayload.status = groupData.status; // Assumes Supabase 'status' column is string compatible
  if (groupData.featured !== undefined) updatePayload.featured = groupData.featured;
  
  return updatePayload;
}