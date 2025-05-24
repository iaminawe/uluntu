export type Json =
  | unknown
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          member_skills: Json | null; // Assuming JSON for skills array/object
          // Add other member fields as needed
        };
        Insert: {
          id?: string; // Usually auto-generated
          created_at?: string;
          name?: string | null;
          member_skills?: Json | null;
          // Add other member fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          member_skills?: Json | null;
          // Add other member fields as needed
        };
      };
      companies: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          industry: string | null;
          // Add other company fields as needed
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          industry?: string | null;
          // Add other company fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          industry?: string | null;
          // Add other company fields as needed
        };
      };
      events: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          // Add other event fields as needed
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          // Add other event fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          // Add other event fields as needed
        };
      };
      groups: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          // Add other group fields as needed
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          // Add other group fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          // Add other group fields as needed
        };
      };
      resources: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          resource_tags: Json | null; // Assuming JSON for tags array/object
          // Add other resource fields as needed
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          resource_tags?: Json | null;
          // Add other resource fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          resource_tags?: Json | null;
          // Add other resource fields as needed
        };
      };
      marketplace_listings: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          type: string | null;
          // Add other marketplace fields as needed
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          type?: string | null;
          // Add other marketplace fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          type?: string | null;
          // Add other marketplace fields as needed
        };
      };
      opportunities: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          // Add other opportunity fields as needed
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          // Add other opportunity fields as needed
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          // Add other opportunity fields as needed
        };
      };
    };
    Views: {
      // Define your views here
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Helper types for Supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// If you have a more specific type for your schema, you can use it here.
// For example, if you generated types with the Supabase CLI:
// import { Database as GeneratedDatabase } from './generated-types'; // Adjust path as needed
// export type ActualDatabase = GeneratedDatabase;