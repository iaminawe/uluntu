// Types for NewsDetailPage components
import { NewsArticle } from '../../types';

export interface ArticleHeaderProps {
  article: NewsArticle;
  id: string;
}

export interface ArticleContentProps {
  article: NewsArticle;
}

export interface AuthorInfoProps {
  author: {
    id: string;
    name: string;
    image: string;
  };
}

export interface RelatedArticlesProps {
  relatedArticles: NewsArticle[];
  isLoading: boolean;
}

export type LoadingStateProps = Record<string, never>;

export type ErrorStateProps = Record<string, never>;
