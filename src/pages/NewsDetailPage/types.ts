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
    id: number;
    name: string;
    image: string;
  };
}

export interface RelatedArticlesProps {
  relatedArticles: NewsArticle[];
  isLoading: boolean;
}

export interface LoadingStateProps {
  // Can include any customization props in the future
}

export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
