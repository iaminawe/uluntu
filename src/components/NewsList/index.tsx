import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import ArticleCard from './ArticleCard';

import Newsletter from './Newsletter';
import { NewsArticle, NewsListProps, FilterOptions, adaptMainNewsArticleToLocal } from './types';
import { 
  filterArticles, 
  sortArticlesByDate 
} from './utils';
import { NewsArticle as MainNewsArticle } from '../../types';

import { useNewsArticlesWithFilters } from '../../hooks/useQueries';

const NewsList = ({ initialTag = 'all', initialSearch = '' }: NewsListProps) => {
  // State for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    tag: initialTag,
  });
  
  // Use the useNewsArticlesWithFilters hook to fetch filtered news articles
  const { 
    data: newsDataArticles, // Renamed to avoid conflict if 'articles' is used later
    isLoading: newsDataIsLoading, 
    error: newsDataError 
  } = useNewsArticlesWithFilters({
    search: filters.search,
    // Ensure 'tag' is string | undefined, not 'all'
    tag: filters.tag && filters.tag !== 'all' ? filters.tag : undefined 
  });

  // Properly extract articles from the hook's data structure, default to empty array if undefined
  const mainArticles = (newsDataArticles || []) as MainNewsArticle[];
  
  // Convert main NewsArticle type to local NewsArticle type using adapter function
  const articles = mainArticles.map(adaptMainNewsArticleToLocal);
  
  // Filter and sort articles based on the fetched data
  // The hook should ideally return pre-filtered data based on search/tags,
  // but if client-side filtering is still needed on top of that:
  const displayedArticles = sortArticlesByDate(filterArticles(articles, filters));
  
  // Render loading state
  if (newsDataIsLoading) {
    return (
      <div>
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
  if (newsDataError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Oops! Something went wrong.
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {String(newsDataError.message || 'Failed to load articles.')}
        </p>
      </div>
    );
  }
  
  return (
    <div>
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
