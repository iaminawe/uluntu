// Database type helpers for better type inference
import type { Database } from '@/shared/types/supabase';

// Extract table types
export type Tables = Database['public']['Tables'];
export type Views = Database['public']['Views'];

// Table row types
export type Comment = Tables['comments']['Row'];
export type Like = Tables['likes']['Row'];
export type Theme = Tables['themes']['Row'];
export type ThemeConfiguration = Tables['theme_configurations']['Row'];
export type ThemeAsset = Tables['theme_assets']['Row'];
export type ThemeMetadata = Tables['theme_metadata']['Row'];

// Insert types
export type CommentInsert = Tables['comments']['Insert'];
export type LikeInsert = Tables['likes']['Insert'];
export type ThemeInsert = Tables['themes']['Insert'];
export type ThemeConfigurationInsert = Tables['theme_configurations']['Insert'];
export type ThemeAssetInsert = Tables['theme_assets']['Insert'];
export type ThemeMetadataInsert = Tables['theme_metadata']['Insert'];

// Update types
export type CommentUpdate = Tables['comments']['Update'];
export type LikeUpdate = Tables['likes']['Update'];
export type ThemeUpdate = Tables['themes']['Update'];
export type ThemeConfigurationUpdate = Tables['theme_configurations']['Update'];
export type ThemeAssetUpdate = Tables['theme_assets']['Update'];
export type ThemeMetadataUpdate = Tables['theme_metadata']['Update'];

// Enum types for entity types
export type CommentEntityType = 'event' | 'news' | 'resource' | 'marketplace' | 'opportunity' | 'group' | 'company';
export type LikeEntityType = 'event' | 'news' | 'resource' | 'marketplace' | 'opportunity' | 'group' | 'company' | 'comment';

// Theme with configurations
export interface ThemeWithConfigurations extends Theme {
  configurations: ThemeConfiguration[];
  assets?: ThemeAsset[];
  metadata?: ThemeMetadata;
}

// Comment with user info
export interface CommentWithUser extends Comment {
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  replies?: CommentWithUser[];
}