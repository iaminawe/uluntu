// Content-related types
export interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: ContentType;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type ContentType = 'article' | 'page' | 'post' | 'news' | 'event' | 'opportunity' | 'marketplace';
export type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface ContentFilter {
  type?: ContentType;
  status?: ContentStatus;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ContentMetadata {
  author?: string;
  tags?: string[];
  category?: string;
  featured?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}