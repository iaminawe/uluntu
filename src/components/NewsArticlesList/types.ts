// Types for NewsArticlesList component
import { NewsArticle as MainNewsArticle } from '../../types';

// Use the main application's NewsArticle type directly
export type NewsArticle = MainNewsArticle;

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
