import { NewsArticle, FilterOptions } from '@/features/news/components/NewsList/types';

// Filter articles based on search term and selected tag
export const filterArticles = (
  articles: NewsArticle[],
  filters: FilterOptions
): NewsArticle[] => {
  
  const filtered = articles.filter(article => {
    // Filter by search term (only if search is not empty)
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      const titleMatches = article.title?.toLowerCase().includes(searchLower) || false;
      const excerptMatches = article.excerpt?.toLowerCase().includes(searchLower) || false;
      const contentMatches = article.content?.toLowerCase().includes(searchLower) || false;
      
      if (!titleMatches && !excerptMatches && !contentMatches) {
        return false;
      }
    }
    
    // Filter by tag (only if tag is not 'all' and not empty)
    if (filters.tag && filters.tag !== 'all' && filters.tag.trim() !== '') {
      if (!article.tags?.includes(filters.tag)) {
        return false;
      }
    }
    
    return true;
  });
  
  return filtered;
};

// Sort articles by published date (newest first)
export const sortArticlesByDate = (articles: NewsArticle[]): NewsArticle[] => {
  return [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};

// Extract unique tags from articles
export const extractUniqueTags = (articles: NewsArticle[]): string[] => {
  return Array.from(
    new Set(articles.flatMap(article => article.tags || []))
  ).sort();
};

// Format date to a readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get time elapsed since published date
export const getTimeElapsed = (dateString: string): string => {
  const publishedDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} months ago`;
  } else {
    return `${Math.floor(diffDays / 365)} years ago`;
  }
};
