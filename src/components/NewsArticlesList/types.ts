// Types for NewsArticlesList component
import { EntityStatus } from '../../data/mock/mockData';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewsAuthor {
  id: string | number;
  name: string;
  image: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewsArticle {
  id: string | number;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  date: string;
  author: NewsAuthor;
  tags?: string[];
  status: EntityStatus | string;
  featured?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NewsArticlesListProps {
  initialTag?: string;
  initialSearch?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FilterOptions {
  search: string;
  tags: string[];
}
