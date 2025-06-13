import { useState, useEffect } from 'react'; // Added useEffect
import { AlertTriangle } from 'lucide-react';

import ArticleCard from '@/features/news/components/NewsArticlesList/ArticleCard';
import FeaturedArticleCard from '@/features/news/components/NewsArticlesList/FeaturedArticleCard';
import Pagination from '@/shared/components/ui/Pagination'; // Import Pagination
import { FilterOptions, NewsArticlesListProps } from '@/features/news/components/NewsArticlesList/types';
import { useNewsArticlesWithFilters } from '@/features/news/hooks/useNewsQueries';

const ARTICLES_PER_PAGE = 4;

const NewsArticlesList = ({ 
  initialTag = '', 
  initialSearch = '' 
}: NewsArticlesListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const filters: FilterOptions = {
    search: initialSearch,
    tags: initialTag ? [initialTag] : [],
  };

  const { 
    data, 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useNewsArticlesWithFilters({
    search: filters.search,
    tag: filters.tags.length > 0 ? filters.tags[0] : undefined
  });
  
  // Extract articles from data or use empty array as fallback
  const articles = data || [];

  // Reset page when articles change (due to filter changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);  // Changed from articles to data since that's what changes when filters change

  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  // Pagination logic for regular articles
  const totalRegularArticles = regularArticles.length;
  const totalPages = Math.ceil(totalRegularArticles / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentRegularArticlesToDisplay = regularArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Consider scrolling to top: window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div>
        {/* Skeleton for featured (if any expected) could be added here */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {Array(ARTICLES_PER_PAGE).fill(0).map((_, i) => (
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
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                     rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading News</h3>
        <p className="text-red-600 dark:text-red-400">{String(error)}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 
                   rounded-md hover:bg-red-200 dark:hover:bg-red-700/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className={`relative ${isRefetching ? 'opacity-60 pointer-events-none' : ''}`}>
        {articles.length === 0 && !isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full 
                          flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {filters.search || filters.tags.length > 0 
                ? 'Try adjusting your filters or search terms.' 
                : 'No news articles have been published yet.'}
            </p>
            {(filters.search || filters.tags.length > 0) && (
              <p className="text-slate-500 dark:text-slate-400">
                Try adjusting your filters in the search bar above.
              </p>
            )}
          </div>
        ) : (
          <>
            {featuredArticles.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Featured</h3>
                <div className="grid grid-cols-1 gap-8">
                  {featuredArticles.map(article => (
                      <FeaturedArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
            
            {regularArticles.length > 0 && (
              <div>
                {(featuredArticles.length > 0 || initialSearch || initialTag) && (
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                    {initialSearch || initialTag ? 'Filtered Articles' : 'Latest Articles'}
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {currentRegularArticlesToDisplay.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsArticlesList;
