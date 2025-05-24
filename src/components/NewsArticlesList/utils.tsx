import { NewsArticle } from '../../data/mock/mockData';

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

// Extract unique tags from articles
export const extractTags = (articles: NewsArticle[]): string[] => {
  if (!articles.length) return [];
  
  // Get all unique tags
  const allTags = new Set<string>();
  
  articles.forEach(article => {
    if (article.tags && article.tags.length > 0) {
      article.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  return Array.from(allTags).sort();
};

// Get excerpt from content if needed
export const truncateExcerpt = (excerpt: string, maxLength: number = 150): string => {
  if (excerpt.length <= maxLength) return excerpt;
  
  // Find the last space before maxLength
  const lastSpace = excerpt.substring(0, maxLength).lastIndexOf(' ');
  
  // If no space found or it's at the beginning, just cut at maxLength
  if (lastSpace <= 0) return excerpt.substring(0, maxLength) + '...';
  
  // Otherwise cut at the last space and add ellipsis
  return excerpt.substring(0, lastSpace) + '...';
};
