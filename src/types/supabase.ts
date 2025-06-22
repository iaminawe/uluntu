export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_feature_translations: {
        Row: {
          created_at: string | null
          description: string | null
          feature_id: string | null
          id: string
          language_code: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_id?: string | null
          id?: string
          language_code: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_id?: string | null
          id?: string
          language_code?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_feature_translations_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "admin_features"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_features: {
        Row: {
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          feature_key: string
          id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          feature_key: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          feature_key?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          cover_image: string | null
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
      company_tags: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          tag_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          tag_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
      event_tags: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
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
      group_tags: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_tags_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
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
          contact_info: Json | null
          created_at: string | null
          description: string
          featured: boolean | null
          id: string
          images: string[] | null
          location: string
          price: number | null
          seller_id: string
          status: string
          tags: string[] | null
          title: string
          type: string
        }
        Insert: {
          condition?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location: string
          price?: number | null
          seller_id: string
          status?: string
          tags?: string[] | null
          title: string
          type: string
        }
        Update: {
          condition?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string
          price?: number | null
          seller_id?: string
          status?: string
          tags?: string[] | null
          title?: string
          type?: string
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
      marketplace_tags: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_tags_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      member_interests: {
        Row: {
          created_at: string | null
          id: string
          interest: string
          member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest: string
          member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_interests_member_id_fkey"
            columns: ["member_id"]
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
      member_tags: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          skill_level: string | null
          tag_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          skill_level?: string | null
          tag_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          skill_level?: string | null
          tag_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "member_tags_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          arrived_in_nelson: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          employment_status: string | null
          featured: boolean | null
          id: string
          image: string | null
          location: string | null
          name: string
          open_to_volunteering: boolean | null
          social: Json | null
          status: string
          title: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          arrived_in_nelson?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          employment_status?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location?: string | null
          name: string
          open_to_volunteering?: boolean | null
          social?: Json | null
          status?: string
          title?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          arrived_in_nelson?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          employment_status?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          location?: string | null
          name?: string
          open_to_volunteering?: boolean | null
          social?: Json | null
          status?: string
          title?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          created_at: string | null
          id: string
          item_data: Json
          item_id: string
          item_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_data: Json
          item_id: string
          item_type: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_data?: Json
          item_id?: string
          item_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string
          updated_at?: string | null
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
      news_tags: {
        Row: {
          created_at: string | null
          id: string
          news_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          news_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          news_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_analytics: {
        Row: {
          campaign_id: string | null
          event_data: Json | null
          event_type: string | null
          id: string
          ip_address: unknown | null
          occurred_at: string | null
          postmark_message_id: string | null
          subscription_id: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: string
          ip_address?: unknown | null
          occurred_at?: string | null
          postmark_message_id?: string | null
          subscription_id?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          event_data?: Json | null
          event_type?: string | null
          id?: string
          ip_address?: unknown | null
          occurred_at?: string | null
          postmark_message_id?: string | null
          subscription_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_analytics_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          branding: Json | null
          content: Json | null
          created_at: string | null
          created_by: string
          custom_message: string | null
          delivery_stats: Json | null
          id: string
          recipient_count: number | null
          scheduled_at: string | null
          send_type: string | null
          sent_at: string | null
          status: string | null
          subject: string
          template_data: Json | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          content?: Json | null
          created_at?: string | null
          created_by: string
          custom_message?: string | null
          delivery_stats?: Json | null
          id?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          send_type?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          template_data?: Json | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          content?: Json | null
          created_at?: string | null
          created_by?: string
          custom_message?: string | null
          delivery_stats?: Json | null
          id?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          send_type?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_data?: Json | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "newsletter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_content_cache: {
        Row: {
          content: Json
          content_type: string
          date_range_end: string
          date_range_start: string
          expires_at: string | null
          generated_at: string | null
          id: string
        }
        Insert: {
          content: Json
          content_type: string
          date_range_end: string
          date_range_start: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
        }
        Update: {
          content?: Json
          content_type?: string
          date_range_end?: string
          date_range_start?: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
        }
        Relationships: []
      }
      newsletter_content_rules: {
        Row: {
          content_type: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_items: number | null
          name: string
          priority: number | null
          selection_criteria: Json | null
          updated_at: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_items?: number | null
          name: string
          priority?: number | null
          selection_criteria?: Json | null
          updated_at?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_items?: number | null
          name?: string
          priority?: number | null
          selection_criteria?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          bounce_count: number | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          id: string
          last_sent_at: string | null
          member_id: string | null
          preferences: Json | null
          status: string | null
          subscribed_at: string | null
          subscription_token: string
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          bounce_count?: number | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_sent_at?: string | null
          member_id?: string | null
          preferences?: Json | null
          status?: string | null
          subscribed_at?: string | null
          subscription_token?: string
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          bounce_count?: number | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_sent_at?: string | null
          member_id?: string | null
          preferences?: Json | null
          status?: string | null
          subscribed_at?: string | null
          subscription_token?: string
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_templates: {
        Row: {
          created_at: string | null
          default_settings: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_image: string | null
          template_content: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_settings?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_image?: string | null
          template_content: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_settings?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_image?: string | null
          template_content?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          benefits: string[] | null
          compensation: string | null
          contact_email: string
          created_at: string | null
          deadline: string | null
          description: string
          featured: boolean | null
          id: string
          image: string | null
          location: string
          organization: string
          posted_by: string
          remote: boolean
          requirements: string[] | null
          responsibilities: string[] | null
          status: string
          title: string
          type: string
          website: string | null
        }
        Insert: {
          benefits?: string[] | null
          compensation?: string | null
          contact_email: string
          created_at?: string | null
          deadline?: string | null
          description: string
          featured?: boolean | null
          id?: string
          image?: string | null
          location: string
          organization: string
          posted_by: string
          remote?: boolean
          requirements?: string[] | null
          responsibilities?: string[] | null
          status?: string
          title: string
          type: string
          website?: string | null
        }
        Update: {
          benefits?: string[] | null
          compensation?: string | null
          contact_email?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          featured?: boolean | null
          id?: string
          image?: string | null
          location?: string
          organization?: string
          posted_by?: string
          remote?: boolean
          requirements?: string[] | null
          responsibilities?: string[] | null
          status?: string
          title?: string
          type?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_tags: {
        Row: {
          created_at: string | null
          id: string
          opportunity_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          opportunity_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          opportunity_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_tags_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
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
          tags: string[] | null
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
          tags?: string[] | null
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
          tags?: string[] | null
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
      tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          status: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          status?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
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
        Args: { name?: string }
        Returns: undefined
      }
      generate_tag_slug: {
        Args: { tag_name: string }
        Returns: string
      }
      is_admin_of_group: {
        Args: { p_user_id: string; p_group_id: string }
        Returns: boolean
      }
      is_member_of_group: {
        Args: { p_user_id: string; p_group_id: string }
        Returns: boolean
      }
      is_superadmin_direct: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
