export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      companies: {
        Row: {
          cover_image: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          founded: string
          id: string
          industry: string[]
          location: string
          logo: string
          name: string
          size: string
          status: string
          website: string | null
        }
        Insert: {
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          founded: string
          id?: string
          industry: string[]
          location: string
          logo: string
          name: string
          size: string
          status?: string
          website?: string | null
        }
        Update: {
          cover_image?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          founded?: string
          id?: string
          industry?: string[]
          location?: string
          logo?: string
          name?: string
          size?: string
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          joined_date: string | null
          member_id: string
          role: string | null
        }
        Insert: {
          company_id: string
          joined_date?: string | null
          member_id: string
          role?: string | null
        }
        Update: {
          company_id?: string
          joined_date?: string | null
          member_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          member_id: string
          registered_at: string | null
          status: string
        }
        Insert: {
          event_id: string
          member_id: string
          registered_at?: string | null
          status?: string
        }
        Update: {
          event_id?: string
          member_id?: string
          registered_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_presenters: {
        Row: {
          bio: string | null
          company: string | null
          id: string
          image: string | null
          member_id: string | null
          name: string | null
          session_id: string
          title: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          id?: string
          image?: string | null
          member_id?: string | null
          name?: string | null
          session_id: string
          title?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          id?: string
          image?: string | null
          member_id?: string | null
          name?: string | null
          session_id?: string
          title?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_presenters_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_presenters_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_resources: {
        Row: {
          id: string
          session_id: string
          title: string
          type: string
          url: string
        }
        Insert: {
          id?: string
          session_id: string
          title: string
          type: string
          url: string
        }
        Update: {
          id?: string
          session_id?: string
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_resources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sessions: {
        Row: {
          description: string
          end_time: string
          event_id: string
          id: string
          start_time: string
          title: string
          video_url: string | null
        }
        Insert: {
          description: string
          end_time: string
          event_id: string
          id?: string
          start_time: string
          title: string
          video_url?: string | null
        }
        Update: {
          description?: string
          end_time?: string
          event_id?: string
          id?: string
          start_time?: string
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          created_at: string | null
          current_attendees: number | null
          date: string
          description: string
          end_date: string | null
          featured: boolean | null
          group_id: string | null
          id: string
          image: string
          latitude: number | null
          location: string
          longitude: number | null
          max_attendees: number | null
          organizer_id: string
          status: string
          title: string
          type: string
          url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          current_attendees?: number | null
          date: string
          description: string
          end_date?: string | null
          featured?: boolean | null
          group_id?: string | null
          id?: string
          image: string
          latitude?: number | null
          location: string
          longitude?: number | null
          max_attendees?: number | null
          organizer_id: string
          status?: string
          title: string
          type: string
          url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          current_attendees?: number | null
          date?: string
          description?: string
          end_date?: string | null
          featured?: boolean | null
          group_id?: string | null
          id?: string
          image?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_attendees?: number | null
          organizer_id?: string
          status?: string
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_date: string
          member_id: string
          role: string
        }
        Insert: {
          group_id: string
          joined_date?: string
          member_id: string
          role: string
        }
        Update: {
          group_id?: string
          joined_date?: string
          member_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string
          featured: boolean | null
          hero_image: string
          id: string
          long_description: string | null
          member_count: number | null
          name: string
          status: string
          visibility: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          hero_image: string
          id?: string
          long_description?: string | null
          member_count?: number | null
          name: string
          status?: string
          visibility: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          hero_image?: string
          id?: string
          long_description?: string | null
          member_count?: number | null
          name?: string
          status?: string
          visibility?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          condition: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          location: string | null
          price: number | null
          seller_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string | null
          price?: number | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_skills: {
        Row: {
          member_id: string
          skill: string
        }
        Insert: {
          member_id: string
          skill: string
        }
        Update: {
          member_id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_skills_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          arrived_in_nelson: string | null
          bio: string | null
          created_at: string | null
          employment_status: string | null
          featured: boolean | null
          id: string
          image: string | null
          intro: string | null
          location: string | null
          name: string
          open_to_volunteering: boolean | null
          status: string
          title: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          arrived_in_nelson?: string | null
          bio?: string | null
          created_at?: string | null
          employment_status?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          intro?: string | null
          location?: string | null
          name: string
          open_to_volunteering?: boolean | null
          status?: string
          title?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          arrived_in_nelson?: string | null
          bio?: string | null
          created_at?: string | null
          employment_status?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          intro?: string | null
          location?: string | null
          name?: string
          open_to_volunteering?: boolean | null
          status?: string
          title?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          hero_image: string | null
          hero_image_alt: string | null
          id: string
          publish_date: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          hero_image?: string | null
          hero_image_alt?: string | null
          id?: string
          publish_date?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          hero_image?: string | null
          hero_image_alt?: string | null
          id?: string
          publish_date?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      news_associations: {
        Row: {
          association_id: string
          association_type: string
          news_id: string
        }
        Insert: {
          association_id: string
          association_type: string
          news_id: string
        }
        Update: {
          association_id?: string
          association_type?: string
          news_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_associations_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          benefits: string[] | null
          compensation: string | null
          contact_email: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          featured: boolean | null
          id: string
          image: string | null
          location: string | null
          organization: string | null
          posted_by: string | null
          remote: boolean | null
          requirements: string[] | null
          responsibilities: string[] | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          benefits?: string[] | null
          compensation?: string | null
          contact_email?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location?: string | null
          organization?: string | null
          posted_by?: string | null
          remote?: boolean | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          benefits?: string[] | null
          compensation?: string | null
          contact_email?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location?: string | null
          organization?: string | null
          posted_by?: string | null
          remote?: boolean | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      resource_tags: {
        Row: {
          resource_id: string
          tag: string
        }
        Insert: {
          resource_id: string
          tag: string
        }
        Update: {
          resource_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_tags_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          contributor_id: string
          created_at: string | null
          description: string
          featured: boolean | null
          group_id: string | null
          id: string
          image: string | null
          status: string
          title: string
          type: string
          url: string
        }
        Insert: {
          contributor_id: string
          created_at?: string | null
          description: string
          featured?: boolean | null
          group_id?: string | null
          id?: string
          image?: string | null
          status?: string
          title: string
          type: string
          url: string
        }
        Update: {
          contributor_id?: string
          created_at?: string | null
          description?: string
          featured?: boolean | null
          group_id?: string | null
          id?: string
          image?: string | null
          status?: string
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_member_profile: {
        Args: { name_to_set: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "authenticated" | "group_member" | "admin" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["authenticated", "group_member", "admin", "superadmin"],
    },
  },
} as const

