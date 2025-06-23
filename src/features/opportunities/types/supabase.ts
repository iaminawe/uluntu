// Supabase database types for opportunities
export interface Database {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          type: string;
          location: string;
          remote: boolean;
          compensation: string | null;
          deadline: string | null;
          contact_email: string;
          website: string | null;
          image: string | null;
          status: string;
          featured: boolean | null;
          organization: string;
          posted_by: string;
          requirements: string[] | null;
          responsibilities: string[] | null;
          benefits: string[] | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          type: string;
          location: string;
          remote?: boolean;
          compensation?: string | null;
          deadline?: string | null;
          contact_email: string;
          website?: string | null;
          image?: string | null;
          status?: string;
          featured?: boolean | null;
          organization: string;
          posted_by: string;
          requirements?: string[] | null;
          responsibilities?: string[] | null;
          benefits?: string[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          type?: string;
          location?: string;
          remote?: boolean;
          compensation?: string | null;
          deadline?: string | null;
          contact_email?: string;
          website?: string | null;
          image?: string | null;
          status?: string;
          featured?: boolean | null;
          organization?: string;
          posted_by?: string;
          requirements?: string[] | null;
          responsibilities?: string[] | null;
          benefits?: string[] | null;
        };
      };
      opportunity_galleries: {
        Row: {
          id: string;
          opportunity_id: string;
          gallery_id: string;
          display_order: number;
          featured: boolean;
          caption: string | null;
          attached_by: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          gallery_id: string;
          display_order?: number;
          featured?: boolean;
          caption?: string | null;
          attached_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          gallery_id?: string;
          display_order?: number;
          featured?: boolean;
          caption?: string | null;
          attached_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
  };
}