import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import ArticleCard from './ArticleCard';
import NewsFilters from './NewsFilters';
import Newsletter from './Newsletter';
import { NewsArticle, NewsListProps, FilterOptions, SAMPLE_ARTICLES } from './types';
import { 
  filterArticles, 
  sortArticlesByDate, 
  extractUniqueTags 
} from './utils';

// Check if we have access to the enhanced data fetching hooks
let useNewsArticlesWithFilters: Function | null = null;

try {
  // Dynamically import the data fetching hook if it exists
  useNewsArticlesWithFilters = require('../../hooks/useQueries').useNewsArticlesWithFilters;
} catch (error) {
  // Fall back to using sample data if the hook isn't available
  console.log('Using sample data for news articles');
}

const NewsList = ({ initialTag = 'all', initialSearch = '' }: NewsListProps) => {
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    tag: initialTag,
  });
  
  // State for articles data when not using hooks
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get all unique tags from articles
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Use the enhanced data fetching hook if available
  const hookResult = useNewsArticlesWithFilters ? 
    useNewsArticlesWithFilters({
      search: filters.search,
      tag: filters.tag !== 'all' ? filters.tag : undefined
    }) : null;
  
  // Extract data from hook or use local state
  const newsData = hookResult ? {
    articles: hookResult.data || [],
    isLoading: hookResult.isLoading,
    error: hookResult.error ? String(hookResult.error) : null
  } : {
    articles,
    isLoading: loading,
    error
  };
  
  // Fetch articles data (simulated) - only used when hook is not available
  useEffect(() => {
    if (useNewsArticlesWithFilters) return; // Skip if using hook
    
    const fetchArticles = async () => {
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set articles from sample data
        setArticles(SAMPLE_ARTICLES);
        setAllTags(extractUniqueTags(SAMPLE_ARTICLES));
        setLoading(false);
      } catch (err) {
        setError('Failed to load news articles. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);
  
  // Update tags when articles change (when using hooks)
  useEffect(() => {
    if (hookResult && hookResult.data) {
      setAllTags(extractUniqueTags(hookResult.data));
    }
  }, [hookResult?.data]);
  
  // Filter and sort articles
  const displayedArticles = !useNewsArticlesWithFilters && newsData.articles.length > 0 ? 
    sortArticlesByDate(filterArticles(newsData.articles, filters)) : 
    newsData.articles;
  
  // Render loading state
  if (newsData.isLoading) {
    return (
      <div>
        <NewsFilters 
          filters={filters} 
          setFilters={setFilters} 
          tags={allTags}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  {[1, 2].map(j => (
                    <div key={j} className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                  ))}
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full mr-2"></div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (newsData.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                    rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading News</h3>
        <p className="text-red-600 dark:text-red-400">{newsData.error}</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Filters */}
      <NewsFilters 
        filters={filters} 
        setFilters={setFilters} 
        tags={allTags}
      />
      
      {/* Results */}
      {displayedArticles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full 
                        flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No articles found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => setFilters({
              search: '',
              tag: 'all'
            })}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 
                     text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 
                     dark:hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedArticles.map((article: NewsArticle) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
      
      {/* Newsletter subscription */}
      <Newsletter />
    </div>
  );
};

export default NewsList;
