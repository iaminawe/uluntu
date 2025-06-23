import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
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
    queryFn: () => newsApi.getFilteredNews(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const featuredQuery = useQuery({
    queryKey: queryKeys.featuredNews,
    queryFn: () => newsApi.getFeaturedNews(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Get single article
  const getArticle = (id: string) => {
    return useQuery({
      queryKey: queryKeys.newsArticle(id),
      queryFn: () => newsApi.getNewsById(id),
      enabled: !!id,
    });
  };
  
  // Mutations
  const createArticle = useMutation({
    mutationFn: (data: NewsArticleInput) => newsApi.createNews(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });
  
  const updateArticle = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewsArticleInput> }) => 
      newsApi.updateNews(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
      queryClient.invalidateQueries({ queryKey: queryKeys.newsArticle(id) });
    },
  });
  
  const deleteArticle = useMutation({
    mutationFn: (id: string) => newsApi.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });
  
  // UI actions
  const setSearchTerm = (search?: string) => {
    dispatch(updateFilters({ search }));
  };
  
  const setTags = (tags?: string[]) => {
    dispatch(updateFilters({ tags }));
  };
  
  const setFeaturedFilter = (featured?: boolean) => {
    dispatch(updateFilters({ featured }));
  };
  
  const resetFilters = () => {
    dispatch(clearFilters());
  };
  
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
    setSelectedArticle: (id: string | null) => dispatch(setSelectedArticle(id)),
    setViewMode: (mode: 'grid' | 'list') => dispatch(setViewMode(mode)),
    setSortBy: (by: 'date' | 'title' | 'featured') => dispatch(setSortBy(by)),
    setSortOrder: (order: 'asc' | 'desc') => dispatch(setSortOrder(order)),
    
    // Queries
    getArticle,
    refetch: articlesQuery.refetch,
    
    // Mutations
    createArticle,
    updateArticle,
    deleteArticle,
  };
}