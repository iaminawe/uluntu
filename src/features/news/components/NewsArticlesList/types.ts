// Types for NewsArticlesList component
import { NewsArticle as MainNewsArticle } from '../../types';

// Use the main application's NewsArticle type directly
export type NewsArticle = MainNewsArticle;

 
export interface NewsArticlesListProps {
  initialTag?: string;
  initialSearch?: string;
}

 
export interface FilterOptions {
  search: string;
  tags: string[];
}
