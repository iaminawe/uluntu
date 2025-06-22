import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchNewsArticles,
  fetchNewsArticleById,
  fetchNewsArticleBySlug,
  fetchFilteredNewsArticles,
  fetchRelatedNewsArticles,
  fetchFeaturedNewsArticles,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  setFilters,
  mergeFilters,
  clearFilters,
  selectAllNewsArticles,
  selectCurrentNewsArticle,
  selectFilteredNewsArticles,
  selectRelatedNewsArticles,
  selectFeaturedNewsArticles,
  selectNewsStatus,
  selectFilteredNewsStatus,
  selectNewsError,
  selectNewsFilters,
  NewsFilters,
  NewsArticleInput
} from '@/features/news/store/newsSlice';

/**
 * Custom hook for accessing and manipulating the news articles collection
 * @returns Object containing news articles data and actions
 */
export function useNewsArticlesRedux() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectAllNewsArticles);
  const status = useAppSelector(selectNewsStatus);
  const error = useAppSelector(selectNewsError);
  
  // Fix: Only show loading if we don't have articles data yet
  const isLoading = articles.length === 0 && status === 'loading';
  const isSuccess = status === 'succeeded' || articles.length > 0;
  const isError = status === 'failed';
  
  // Load articles if needed
  const loadArticles = () => {
    if (status === 'idle') {
      dispatch(fetchNewsArticles());
    }
  };

  return {
    articles,
    isLoading,
    isSuccess,
    isError,
    error,
    loadArticles,
    createArticle: (article: NewsArticleInput) => dispatch(createNewsArticle(article)),
    updateArticle: (id: string, data: Partial<NewsArticleInput>) => dispatch(updateNewsArticle({ id, data })),
    deleteArticle: (id: string) => dispatch(deleteNewsArticle(id)),
  };
}

/**
 * Custom hook for working with a single news article by ID
 * @param id The ID of the article to fetch
 * @returns Object containing article data and actions
 */
export function useNewsArticleByIdRedux(id?: string) {
  const dispatch = useAppDispatch();
  const article = useAppSelector(selectCurrentNewsArticle);
  const status = useAppSelector(selectNewsStatus);
  const error = useAppSelector(selectNewsError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load article if we have an ID
  useEffect(() => {
    if (id && status === 'idle') {
      dispatch(fetchNewsArticleById(id));
    }
  }, [id, status, dispatch]);

  return {
    article,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshArticle: id ? () => dispatch(fetchNewsArticleById(id)) : () => {},
    updateArticle: (data: Partial<NewsArticleInput>) => id ? dispatch(updateNewsArticle({ id, data })) : Promise.resolve(),
    deleteArticle: id ? () => dispatch(deleteNewsArticle(id)) : () => Promise.resolve(),
  };
}

/**
 * Custom hook for working with a single news article by slug
 * @param slug The slug of the article to fetch
 * @returns Object containing article data and actions
 */
export function useNewsArticleBySlugRedux(slug?: string) {
  const dispatch = useAppDispatch();
  const article = useAppSelector(selectCurrentNewsArticle);
  const status = useAppSelector(selectNewsStatus);
  const error = useAppSelector(selectNewsError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load article if we have a slug
  useEffect(() => {
    if (slug && status === 'idle') {
      dispatch(fetchNewsArticleBySlug(slug));
    }
  }, [slug, status, dispatch]);

  return {
    article,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshArticle: slug ? () => dispatch(fetchNewsArticleBySlug(slug)) : () => {},
    updateArticle: (data: Partial<NewsArticleInput>) => article?.id ? dispatch(updateNewsArticle({ id: article.id, data })) : Promise.resolve(),
    deleteArticle: article?.id ? () => dispatch(deleteNewsArticle(article.id)) : () => Promise.resolve(),
  };
}

/**
 * Custom hook for working with filtered news articles
 * @param initialFilters Optional initial filters to apply
 * @returns Object containing filtered articles data and filter actions
 */
export function useFilteredNewsArticlesRedux(initialFilters?: NewsFilters) {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(selectFilteredNewsArticles);
  const currentFilters = useAppSelector(selectNewsFilters);
  const status = useAppSelector(selectFilteredNewsStatus);
  const error = useAppSelector(selectNewsError);
  
  // If we have articles, don't show loading even if status is loading
  const isLoading = status === 'loading' && articles.length === 0;
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';
  
  // Load articles once on mount
  useEffect(() => {
    dispatch(fetchFilteredNewsArticles({}));
  }, []); // Only run once on mount

  // Helper for updating just certain filters without affecting others
  const updateFilters = useCallback((newFilters: Partial<NewsFilters>) => {
    dispatch(mergeFilters(newFilters));
  }, [dispatch]);

  // Pagination logic
  const getPaginatedArticles = useMemo(() => {
    return (page: number, itemsPerPage: number) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return articles.slice(startIndex, endIndex);
    };
  }, [articles]);

  return {
    articles,
    filteredArticles: articles, // Add this alias for consistency
    filters: currentFilters,
    isLoading,
    isSuccess,
    isError,
    error,
    updateFilters,
    setSearchTerm: useCallback((search?: string) => updateFilters({ search }), [updateFilters]),
    setTags: useCallback((tags?: string[]) => updateFilters({ tags }), [updateFilters]),
    setFeatured: useCallback((featured?: boolean) => updateFilters({ featured }), [updateFilters]),
    setStatus: useCallback((status?: 'published' | 'draft' | 'archived') => updateFilters({ status }), [updateFilters]),
    clearAllFilters: () => dispatch(clearFilters()),
    getPaginatedArticles,
    totalArticles: articles.length
  };
}

/**
 * Custom hook for working with related news articles
 * @param articleId The ID of the article to find related articles for
 * @param limit Optional limit of related articles to fetch
 * @returns Object containing related articles data
 */
export function useRelatedNewsArticlesRedux(articleId?: string, limit: number = 3) {
  const dispatch = useAppDispatch();
  const relatedArticles = useAppSelector(selectRelatedNewsArticles);
  const status = useAppSelector(selectNewsStatus);
  const error = useAppSelector(selectNewsError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load related articles if we have an article ID
  useEffect(() => {
    if (articleId && status === 'idle') {
      dispatch(fetchRelatedNewsArticles({ id: articleId, limit }));
    }
  }, [articleId, limit, status, dispatch]);

  return {
    relatedArticles,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshRelatedArticles: articleId ? () => dispatch(fetchRelatedNewsArticles({ id: articleId, limit })) : () => {},
  };
}

/**
 * Custom hook for working with featured news articles
 * @returns Object containing featured articles data
 */
export function useFeaturedNewsArticlesRedux() {
  const dispatch = useAppDispatch();
  const featuredArticles = useAppSelector(selectFeaturedNewsArticles);
  const status = useAppSelector(selectNewsStatus);
  const error = useAppSelector(selectNewsError);
  
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  // Load featured articles if needed
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFeaturedNewsArticles());
    }
  }, [status, dispatch]);

  return {
    featuredArticles,
    isLoading,
    isSuccess,
    isError,
    error,
    refreshFeaturedArticles: () => dispatch(fetchFeaturedNewsArticles()),
  };
}
