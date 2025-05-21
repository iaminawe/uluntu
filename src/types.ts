// Common types for the application

export interface Member {
  id: number;
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  skills?: string[];
  joinDate: string;
  featured?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface Company {
  id: number;
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  featured?: boolean;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  employees?: number[];
}

export interface Event {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  image: string;
  organizer: {
    id: number;
    name: string;
    image: string;
  };
  attendees?: number;
  type: 'in-person' | 'online' | 'hybrid';
  featured?: boolean;
  url?: string;
}

export interface GroupMember {
  id: number;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

export interface Group {
  id: number;
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
  featured?: boolean;
  members: GroupMember[];
  events?: any[];
  resources?: any[];
  posts?: any[];
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image?: string;
  featured?: boolean;
  author: {
    id: number;
    name: string;
    image: string;
  };
  tags?: string[];
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document';
  url: string;
  image?: string;
  dateAdded: string;
  contributor: {
    id: number;
    name: string;
  };
}

export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price?: number;
  type: 'service' | 'product' | 'event';
  category: string;
  image?: string;
  seller: {
    id: number;
    name: string;
    image: string;
  };
  datePosted: string;
}

export interface Opportunity {
  id: number;
  title: string;
  company: {
    id: number;
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
