// Core application types
import { BaseEntity, ContentStatus, SocialLinks, Location } from './types/common';

// Session and Presenter types for events
export interface EventSessionResource {
  id: string;
  title: string;
  url: string;
  type: 'slides' | 'document' | 'code' | 'website' | 'other';
}

export interface EventSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  presenters: EventPresenter[];
  videoUrl?: string; // URL for YouTube or Vimeo video
  resources?: EventSessionResource[];
}

export interface EventPresenter {
  id: string;
  name: string;
  image: string;
  bio?: string;
  title?: string;
  company?: string;
  website?: string;
}

export interface Member extends BaseEntity {
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  intro?: string; // Short introduction sentence
  skills?: string[];
  joinDate: string;
  social?: SocialLinks;
  status: ContentStatus; // Override the optional status from BaseEntity
}

export interface Company extends BaseEntity {
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website?: string;
  social?: SocialLinks;
  employees?: string[];
}

export interface Event extends BaseEntity {
  title: string;
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description: string;
  image: string;
  organizer: {
    id: string;
    name: string;
    image: string;
  };
  attendees?: number;
  max_attendees?: number | null;
  current_attendees?: number | null;
  type: 'in-person' | 'online' | 'hybrid';
  url?: string;
  group_id?: string;
  sessions?: EventSession[];
}

export interface GroupMember {
  id: string;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

export interface GroupPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  image?: string;
}

export interface Group extends BaseEntity {
  name: string;
  description: string;
  longDescription?: string;
  heroImage: string;
  coverImage?: string;
  visibility: 'open' | 'closed' | 'secret';
  memberCount: number;
  eventCount?: number;
  resourceCount?: number;
  postCount?: number;
  lastActive: string;
  members: GroupMember[];
  events?: Event[];
  resources?: Resource[];
  posts?: GroupPost[];
}

export interface NewsArticle extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string; // Corresponds to publish_date
  image?: string;
  hero_image_alt?: string; // Corresponds to hero_image
  author: {
    id: string;
    name: string;
    image: string;
  };
  tags?: string[];
}

// Re-export common types for backward compatibility
export type { ContentStatus, BaseEntity, SocialLinks, Location };

export interface Resource extends BaseEntity {
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document' | 'link'; // Added 'link' for broader compatibility
  url: string;
  image?: string;
  dateAdded: string; // Ensure this is always provided when creating a Resource
  contributor: { // Ensure this is always provided
    id: string;
    name: string;
  };
  groupId?: string;
  tags?: string[]; // Added to align with ExtendedFrontendResource and common usage
}

export interface MarketplaceItem extends BaseEntity {
  title: string;
  description: string;
  price?: number;
  type: 'service' | 'product' | 'event';
  category: string;
  image?: string;
  seller: {
    id: string;
    name: string;
    image: string;
  };
  datePosted: string;
}

export interface CompanyMember {
  company_id: string;
  member_id: string;
  role?: string;
  joined_date?: string;
  member?: Member;
}

export interface CompanyEmployee {
  id: string;
  company_id: string;
  member_id: string;
  role?: string;
  department?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  created_at: string;
  updated_at?: string;
  member?: Member;
}

export interface Opportunity extends BaseEntity {
  title: string;
  company: {
    id: string;
    name: string;
    logo: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  location: string;
  remote: boolean;
  description: string;
  salary?: string;
  postedDate: string;
  deadline?: string;
}

// Export types from subdirectories
export * from './types/content';

// Consolidated opportunity types from opportunity.ts
export type OpportunityType = 'job' | 'volunteer' | 'funding' | 'community' | 'full-time' | 'part-time' | 'contract';
