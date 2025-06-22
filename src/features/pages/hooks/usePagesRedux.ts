import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchPages,
  fetchPageById,
  fetchPageBySlug,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
  setFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentPage,
  setPagination,
  clearError,
  optimisticUpdatePage,
  optimisticDeletePage,
} from '../store/pagesSlice';
import type { Page, PageFilters, CreatePageData, UpdatePageData } from '../types';

export const usePagesRedux = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.pages);

  // Actions
  const actions = {
    // Fetch operations
    fetchPages: useCallback(
      (params?: { filters?: PageFilters; page?: number; limit?: number }) =>
        dispatch(fetchPages(params)),
      [dispatch]
    ),

    fetchPageById: useCallback(
      (id: string) => dispatch(fetchPageById(id)),
      [dispatch]
    ),

    fetchPageBySlug: useCallback(
      (slug: string) => dispatch(fetchPageBySlug(slug)),
      [dispatch]
    ),

    // CRUD operations
    createPage: useCallback(
      (pageData: CreatePageData) => dispatch(createPage(pageData)),
      [dispatch]
    ),

    updatePage: useCallback(
      (pageData: UpdatePageData) => dispatch(updatePage(pageData)),
      [dispatch]
    ),

    deletePage: useCallback(
      (id: string) => dispatch(deletePage(id)),
      [dispatch]
    ),

    // Publishing operations
    publishPage: useCallback(
      (id: string) => dispatch(publishPage(id)),
      [dispatch]
    ),

    unpublishPage: useCallback(
      (id: string) => dispatch(unpublishPage(id)),
      [dispatch]
    ),

    // State management
    setFilters: useCallback(
      (filters: Partial<PageFilters>) => dispatch(setFilters(filters)),
      [dispatch]
    ),

    clearFilters: useCallback(
      () => dispatch(clearFilters()),
      [dispatch]
    ),

    setCurrentPage: useCallback(
      (page: Page | null) => dispatch(setCurrentPage(page)),
      [dispatch]
    ),

    clearCurrentPage: useCallback(
      () => dispatch(clearCurrentPage()),
      [dispatch]
    ),

    setPagination: useCallback(
      (pagination: Partial<typeof state.pagination>) => dispatch(setPagination(pagination)),
      [dispatch, state.pagination]
    ),

    clearError: useCallback(
      () => dispatch(clearError()),
      [dispatch]
    ),

    // Optimistic updates
    optimisticUpdatePage: useCallback(
      (pageData: UpdatePageData) => dispatch(optimisticUpdatePage(pageData)),
      [dispatch]
    ),

    optimisticDeletePage: useCallback(
      (id: string) => dispatch(optimisticDeletePage(id)),
      [dispatch]
    ),
  };

  // Selectors
  const selectors = {
    // Get page by ID
    getPageById: useCallback(
      (id: string) => state.pages.find(page => page.id === id),
      [state.pages]
    ),

    // Get page by slug
    getPageBySlug: useCallback(
      (slug: string) => state.pages.find(page => page.slug === slug),
      [state.pages]
    ),

    // Get published pages
    getPublishedPages: useCallback(
      () => state.pages.filter(page => page.status === 'published'),
      [state.pages]
    ),

    // Get draft pages
    getDraftPages: useCallback(
      () => state.pages.filter(page => page.status === 'draft'),
      [state.pages]
    ),

    // Get featured pages
    getFeaturedPages: useCallback(
      () => state.pages.filter(page => page.is_featured),
      [state.pages]
    ),

    // Get pages by author
    getPagesByAuthor: useCallback(
      (authorId: string) => state.pages.filter(page => page.author_id === authorId),
      [state.pages]
    ),

    // Check if page exists by slug
    pageExistsBySlug: useCallback(
      (slug: string) => state.pages.some(page => page.slug === slug),
      [state.pages]
    ),

    // Get total pages count
    getTotalPagesCount: useCallback(
      () => state.pagination.total,
      [state.pagination.total]
    ),

    // Check if loading
    isLoading: useCallback(
      () => state.loading,
      [state.loading]
    ),

    // Check if has error
    hasError: useCallback(
      () => Boolean(state.error),
      [state.error]
    ),
  };

  return {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Selectors
    ...selectors,
  };
};

export default usePagesRedux;