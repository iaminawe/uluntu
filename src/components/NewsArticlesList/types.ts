// Types for NewsArticlesList component
import { EntityStatus } from '../../data/mock/mockData';

export interface NewsAuthor {
  id: number;
  name: string;
  image: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: NewsAuthor;
  tags: string[];
  status: EntityStatus;
  featured: boolean;
}

export interface NewsArticlesListProps {
  initialTag?: string;
  initialSearch?: string;
}

export interface FilterOptions {
  search: string;
  tags: string[];
}
