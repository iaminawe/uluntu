// News types
export type { NewsArticle } from '@/types';
import type { ContentStatus } from '@/types/common';
export type { ContentStatus };

export interface NewsFilters {
  search?: string;
  author?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: ContentStatus;
}

export interface NewsArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  image?: string;
  author_id: string;
  tags?: string[];
  status?: ContentStatus;
}