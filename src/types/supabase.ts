export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          created_at: string | null
          name: string
          title: string | null
          bio: string | null
          location: string | null
          image: string | null
          website: string | null
          employment_status: string | null
          open_to_volunteering: boolean | null
          arrived_in_nelson: string | null
          user_id: string | null
          status: string
          featured: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          title?: string | null
          bio?: string | null
          location?: string | null
          image?: string | null
          website?: string | null
          employment_status?: string | null
          open_to_volunteering?: boolean | null
          arrived_in_nelson?: string | null
          user_id?: string | null
          status?: string
          featured?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          title?: string | null
          bio?: string | null
          location?: string | null
          image?: string | null
          website?: string | null
          employment_status?: string | null
          open_to_volunteering?: boolean | null
          arrived_in_nelson?: string | null
          user_id?: string | null
          status?: string
          featured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      companies: {
        Row: {
          id: string
          created_at: string | null
          name: string
          description: string
          logo: string
          cover_image: string | null
          industry: string[]
          size: string
          founded: string
          location: string
          website: string | null
          status: string
          featured: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          description: string
          logo: string
          cover_image?: string | null
          industry: string[]
          size: string
          founded: string
          location: string
          website?: string | null
          status?: string
          featured?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          description?: string
          logo?: string
          cover_image?: string | null
          industry?: string[]
          size?: string
          founded?: string
          location?: string
          website?: string | null
          status?: string
          featured?: boolean | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          member_id: string
          role: string | null
          joined_date: string | null
        }
        Insert: {
          company_id: string
          member_id: string
          role?: string | null
          joined_date?: string | null
        }
        Update: {
          company_id?: string
          member_id?: string
          role?: string | null
          joined_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      groups: {
        Row: {
          id: string
          created_at: string | null
          name: string
          description: string
          long_description: string | null
          hero_image: string
          cover_image: string | null
          visibility: string
          member_count: number | null
          status: string
          featured: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          name: string
          description: string
          long_description?: string | null
          hero_image: string
          cover_image?: string | null
          visibility: string
          member_count?: number | null
          status?: string
          featured?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          name?: string
          description?: string
          long_description?: string | null
          hero_image?: string
          cover_image?: string | null
          visibility?: string
          member_count?: number | null
          status?: string
          featured?: boolean | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          member_id: string
          role: string
          joined_date: string
        }
        Insert: {
          group_id: string
          member_id: string
          role: string
          joined_date: string
        }
        Update: {
          group_id?: string
          member_id?: string
          role?: string
          joined_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          created_at: string | null
          title: string
          description: string
          date: string
          end_date: string | null
          location: string
          address: string | null
          latitude: number | null
          longitude: number | null
          image: string
          type: string
          url: string | null
          status: string
          featured: boolean | null
          organizer_id: string
          max_attendees: number | null
          current_attendees: number | null
          group_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          description: string
          date: string
          end_date?: string | null
          location: string
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          image: string
          type: string
          url?: string | null
          status?: string
          featured?: boolean | null
          organizer_id: string
          max_attendees?: number | null
          current_attendees?: number | null
          group_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          description?: string
          date?: string
          end_date?: string | null
          location?: string
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          image?: string
          type?: string
          url?: string | null
          status?: string
          featured?: boolean | null
          organizer_id?: string
          max_attendees?: number | null
          current_attendees?: number | null
          group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      event_sessions: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          video_url: string | null
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          video_url?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sessions_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      event_presenters: {
        Row: {
          id: string
          session_id: string
          member_id: string | null
          name: string | null
          image: string | null
          bio: string | null
          title: string | null
          company: string | null
          website: string | null
        }
        Insert: {
          id?: string
          session_id: string
          member_id?: string | null
          name?: string | null
          image?: string | null
          bio?: string | null
          title?: string | null
          company?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          member_id?: string | null
          name?: string | null
          image?: string | null
          bio?: string | null
          title?: string | null
          company?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_presenters_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_presenters_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      event_resources: {
        Row: {
          id: string
          session_id: string
          title: string
          url: string
          type: string
        }
        Insert: {
          id?: string
          session_id: string
          title: string
          url: string
          type: string
        }
        Update: {
          id?: string
          session_id?: string
          title?: string
          url?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_resources_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          member_id: string
          registered_at: string
          status: string
        }
        Insert: {
          event_id: string
          member_id: string
          registered_at?: string
          status?: string
        }
        Update: {
          event_id?: string
          member_id?: string
          registered_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      news: {
        Row: {
          id: string
          created_at: string | null
          title: string
          slug: string
          content: string
          excerpt: string | null
          hero_image: string | null
          hero_image_alt: string | null
          publish_date: string | null
          status: string
          tags: string[] | null
          author_id: string | null
          featured: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          slug: string
          content: string
          excerpt?: string | null
          hero_image?: string | null
          hero_image_alt?: string | null
          publish_date?: string | null
          status?: string
          tags?: string[] | null
          author_id?: string | null
          featured?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          hero_image?: string | null
          hero_image_alt?: string | null
          publish_date?: string | null
          status?: string
          tags?: string[] | null
          author_id?: string | null
          featured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      news_associations: {
        Row: {
          news_id: string
          association_type: string
          association_id: string
        }
        Insert: {
          news_id: string
          association_type: string
          association_id: string
        }
        Update: {
          news_id?: string
          association_type?: string
          association_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_associations_news_id_fkey"
            columns: ["news_id"]
            referencedRelation: "news"
            referencedColumns: ["id"]
          }
        ]
      }
      resources: {
        Row: {
          id: string
          created_at: string | null
          title: string
          description: string
          type: string
          url: string
          image: string | null
          status: string
          featured: boolean | null
          contributor_id: string
          group_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          description: string
          type: string
          url: string
          image?: string | null
          status?: string
          featured?: boolean | null
          contributor_id: string
          group_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          description?: string
          type?: string
          url?: string
          image?: string | null
          status?: string
          featured?: boolean | null
          contributor_id?: string
          group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_contributor_id_fkey"
            columns: ["contributor_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          }
        ]
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
            referencedRelation: "resources"
            referencedColumns: ["id"]
          }
        ]
      }
      marketplace_listings: {
        Row: {
          id: string
          created_at: string | null
          title: string
          description: string
          type: string
          price: number | null
          condition: string | null
          images: string[] | null
          seller_id: string
          location: string
          tags: string[] | null
          status: string
          featured: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          description: string
          type: string
          price?: number | null
          condition?: string | null
          images?: string[] | null
          seller_id: string
          location: string
          tags?: string[] | null
          status?: string
          featured?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          description?: string
          type?: string
          price?: number | null
          condition?: string | null
          images?: string[] | null
          seller_id?: string
          location?: string
          tags?: string[] | null
          status?: string
          featured?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      opportunities: {
        Row: {
          id: string
          created_at: string | null
          title: string
          description: string
          type: string
          location: string
          remote: boolean
          compensation: string | null
          deadline: string | null
          contact_email: string
          website: string | null
          image: string | null
          status: string
          featured: boolean | null
          organization: string
          posted_by: string
          requirements: string[] | null
          responsibilities: string[] | null
          benefits: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          title: string
          description: string
          type: string
          location: string
          remote: boolean
          compensation?: string | null
          deadline?: string | null
          contact_email: string
          website?: string | null
          image?: string | null
          status?: string
          featured?: boolean | null
          organization: string
          posted_by: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string | null
          title?: string
          description?: string
          type?: string
          location?: string
          remote?: boolean
          compensation?: string | null
          deadline?: string | null
          contact_email?: string
          website?: string | null
          image?: string | null
          status?: string
          featured?: boolean | null
          organization?: string
          posted_by?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_posted_by_fkey"
            columns: ["posted_by"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
        }
        Insert: {
          user_id: string
          role: string
        }
        Update: {
          user_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}