import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { newsApi } from '../api/newsApi';
import { 
  selectNewsFilters,
  selectSelectedArticleId,
  selectNewsViewMode,
  selectNewsSortBy,
  selectNewsSortOrder,
  updateFilters,
  clearFilters,
  setSelectedArticle,
  setViewMode,
  setSortBy,
  setSortOrder,
} from '../store/newsUISlice';
import { NewsArticle, NewsArticleInput } from '@/types';
import { queryKeys } from '@/config/queryClient';

export function useNewsHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // UI state from Redux
  const filters = useAppSelector(selectNewsFilters);
  const selectedArticleId = useAppSelector(selectSelectedArticleId);
  const viewMode = useAppSelector(selectNewsViewMode);
  const sortBy = useAppSelector(selectNewsSortBy);
  const sortOrder = useAppSelector(selectNewsSortOrder);
  
  // React Query for server state
  const articlesQuery = useQuery({
    queryKey: queryKeys.newsWithFilters(filters),
    queryFn: () => newsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const featuredQuery = useQuery({
    queryKey: queryKeys.featuredNews,
    queryFn: () => newsApi.getAll({ featured: true }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Get single article by ID
  const getArticle = (id: string) => {
    return useQuery({
      queryKey: queryKeys.newsArticle(id),
      queryFn: () => newsApi.getById(id),
      enabled: !!id,
    });
  };
  
  // Get single article by slug
  const getArticleBySlug = (slug: string) => {
    return useQuery({
      queryKey: ['news', 'slug', slug],
      queryFn: () => newsApi.getBySlug(slug),
      enabled: !!slug,
    });
  };
  
  // Get related articles
  const getRelatedArticles = (articleId: string, limit: number = 3) => {
    return useQuery({
      queryKey: ['news', 'related', articleId, limit],
      queryFn: () => newsApi.getRelated(articleId, limit),
      enabled: !!articleId,
    });
  };
  
  // Mutations
  const createArticle = useMutation({
    mutationFn: (data: Partial<NewsArticle>) => newsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });
  
  const updateArticle = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsArticle> }) => 
      newsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
      queryClient.invalidateQueries({ queryKey: queryKeys.newsArticle(id) });
    },
  });
  
  const deleteArticle = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });
  
  // UI actions
  const setSearchTerm = useCallback((search?: string) => {
    dispatch(updateFilters({ search }));
  }, [dispatch]);
  
  const setTags = useCallback((tags?: string[]) => {
    dispatch(updateFilters({ tags }));
  }, [dispatch]);
  
  const setFeaturedFilter = useCallback((featured?: boolean) => {
    dispatch(updateFilters({ featured }));
  }, [dispatch]);
  
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);
  
  // Sort and filter articles
  const sortedArticles = [...(articlesQuery.data || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.publish_date || '').getTime() - 
                    new Date(b.publish_date || '').getTime();
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'featured':
        comparison = (a.featured ? 1 : 0) - (b.featured ? 1 : 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return {
    // Data
    articles: sortedArticles,
    featuredArticles: featuredQuery.data || [],
    isLoading: articlesQuery.isLoading,
    isFeaturedLoading: featuredQuery.isLoading,
    error: articlesQuery.error,
    
    // UI state
    filters,
    selectedArticleId,
    viewMode,
    sortBy,
    sortOrder,
    
    // Actions
    setSearchTerm,
    setTags,
    setFeaturedFilter,
    resetFilters,
    setSelectedArticle: useCallback((id: string | null) => dispatch(setSelectedArticle(id)), [dispatch]),
    setViewMode: useCallback((mode: 'grid' | 'list') => dispatch(setViewMode(mode)), [dispatch]),
    setSortBy: useCallback((by: 'date' | 'title' | 'featured') => dispatch(setSortBy(by)), [dispatch]),
    setSortOrder: useCallback((order: 'asc' | 'desc') => dispatch(setSortOrder(order)), [dispatch]),
    
    // Queries
    getArticle,
    getArticleBySlug,
    getRelatedArticles,
    refetch: articlesQuery.refetch,
    
    // Mutations
    createArticle,
    updateArticle,
    deleteArticle,
  };
}