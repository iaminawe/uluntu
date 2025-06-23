// Opportunity types and interfaces
import { BaseEntity, ContentStatus } from '@/types/common';
import { Gallery } from '@/features/gallery/types';

export interface Opportunity extends BaseEntity {
  title: string;
  company: {
    id: string;
    name: string;
    logo: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'job' | 'funding' | 'community';
  location: string;
  remote: boolean;
  description: string;
  salary?: string;
  postedDate: string;
  deadline?: string;
  organization?: string;
  contactEmail?: string;
  website?: string;
  image?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  featured?: boolean;
  postedBy?: string;
  galleries?: OpportunityGallery[];
}

// Gallery attachment interface
export interface OpportunityGallery {
  id: string;
  opportunity_id: string;
  gallery_id: string;
  display_order: number;
  featured: boolean;
  caption?: string;
  attached_by?: string;
  created_at: string;
  updated_at?: string;
  
  // Gallery details (joined data)
  gallery?: Gallery & {
    owner_name?: string;
    owner_image?: string;
  };
}

// Input types for API operations
export interface AttachGalleryInput {
  opportunity_id: string;
  gallery_id: string;
  display_order?: number;
  featured?: boolean;
  caption?: string;
}

export interface UpdateGalleryAttachmentInput {
  display_order?: number;
  featured?: boolean;
  caption?: string;
}

// Gallery selection interface for UI components
export interface AttachableGallery extends Gallery {
  owner_name?: string;
  owner_image?: string;
  is_attached: boolean;
}

// Filter types
export interface OpportunityFilters {
  search?: string;
  type?: string[];
  remote?: boolean;
  location?: string[];
  featured?: boolean;
  hasGalleries?: boolean;
}

export type OpportunityType = 'job' | 'volunteer' | 'funding' | 'community' | 'full-time' | 'part-time' | 'contract';

export * from './supabase';