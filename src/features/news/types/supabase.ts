import type { Database } from '@/types/supabase';
export type { Database };

export type NewsArticleRow = Database['public']['Tables']['news']['Row'];
export type NewsArticleInsert = Database['public']['Tables']['news']['Insert'];
export type NewsArticleUpdate = Database['public']['Tables']['news']['Update'];