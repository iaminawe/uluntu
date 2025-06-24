// Supabase types for groups
export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: string;
          description: string;
          long_description?: string;
          hero_image?: string;
          cover_image?: string;
          visibility: 'public' | 'private' | 'members_only';
          status: 'published' | 'draft';
          featured: boolean;
          member_count?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description: string;
          long_description?: string;
          hero_image?: string;
          cover_image?: string;
          visibility?: 'public' | 'private' | 'members_only';
          status?: 'published' | 'draft';
          featured?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          long_description?: string;
          hero_image?: string;
          cover_image?: string;
          visibility?: 'public' | 'private' | 'members_only';
          status?: 'published' | 'draft';
          featured?: boolean;
        };
      };
    };
  };
}

export type GroupRow = Database['public']['Tables']['groups']['Row'];
export type GroupInsert = Database['public']['Tables']['groups']['Insert'];
export type GroupUpdate = Database['public']['Tables']['groups']['Update'];