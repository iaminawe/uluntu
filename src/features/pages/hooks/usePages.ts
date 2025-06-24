import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchPages,
  fetchPageById,
  fetchPageBySlug,
  fetchHomePage,
  fetchFilteredPages,
  fetchChildPages,
  createPage,
  updatePage,
  deletePage,
  setFilters,
  mergeFilters,
  clearFilters,
  clearPages,
  setCurrentPage,
  selectAllPages,
  selectCurrentPage,
  selectFilteredPages,
  selectHomePage,
  selectChildPages,
  selectPagesStatus,
  selectFilteredPagesStatus,
  selectCurrentPageStatus,
  selectPagesError,
  selectPagesFilters
} from '../store/pagesSlice';
import type { Page, CreatePageData, UpdatePageData, PageFilters } from '../types';

export const usePages = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const pages = useAppSelector(selectAllPages);
  const currentPage = useAppSelector(selectCurrentPage);
  const filteredPages = useAppSelector(selectFilteredPages);
  const homePage = useAppSelector(selectHomePage);
  const childPages = useAppSelector(selectChildPages);
  const status = useAppSelector(selectPagesStatus);
  const filteredStatus = useAppSelector(selectFilteredPagesStatus);
  const currentPageStatus = useAppSelector(selectCurrentPageStatus);
  const error = useAppSelector(selectPagesError);
  const filters = useAppSelector(selectPagesFilters);

  // Action creators
  const loadPages = useCallback(() => {
    return dispatch(fetchPages());
  }, [dispatch]);

  const loadPageById = useCallback((id: string) => {
    return dispatch(fetchPageById(id));
  }, [dispatch]);

  const loadPageBySlug = useCallback((slug: string) => {
    return dispatch(fetchPageBySlug(slug));
  }, [dispatch]);

  const loadHomePage = useCallback(() => {
    return dispatch(fetchHomePage());
  }, [dispatch]);

  const loadFilteredPages = useCallback((filters: PageFilters) => {
    return dispatch(fetchFilteredPages(filters));
  }, [dispatch]);

  const loadChildPages = useCallback((parentId: string) => {
    return dispatch(fetchChildPages(parentId));
  }, [dispatch]);

  const createNewPage = useCallback((pageData: CreatePageData) => {
    return dispatch(createPage(pageData));
  }, [dispatch]);

  const updateExistingPage = useCallback((id: string, data: Partial<UpdatePageData>) => {
    const updateData: UpdatePageData = { id, ...data };
    return dispatch(updatePage(updateData));
  }, [dispatch]);

  const removepágina = useCallback((id: string) => {
    return dispatch(deletePage(id));
  }, [dispatch]);

  const updateFilters = useCallback((newFilters: PageFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const addToFilters = useCallback((partialFilters: Partial<PageFilters>) => {
    dispatch(mergeFilters(partialFilters));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearAllPages = useCallback(() => {
    dispatch(clearPages());
  }, [dispatch]);

  const setPage = useCallback((page: Page | null) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  // Computed values
  const isLoading = status === 'loading' || currentPageStatus === 'loading';
  const isFiltering = filteredStatus === 'loading';
  const hasError = !!error;
  const hasPages = pages.length > 0;
  const hasFilteredPages = filteredPages.length > 0;

  // Helper functions
  const getPageBySlug = useCallback((slug: string): Page | undefined => {
    return pages.find(page => page.slug === slug);
  }, [pages]);

  const getPageById = useCallback((id: string): Page | undefined => {
    return pages.find(page => page.id === id);
  }, [pages]);

  const getPublishedPages = useCallback((): Page[] => {
    return pages.filter(page => page.status === 'published' && !!(page as any).is_published);
  }, [pages]);

  const getDraftPages = useCallback((): Page[] => {
    return pages.filter(page => page.status === 'draft' || !(page as any).is_published);
  }, [pages]);

  const getPagesByTemplate = useCallback((template: string): Page[] => {
    return pages.filter(page => page.template === template);
  }, [pages]);

  const getRootPages = useCallback((): Page[] => {
    return pages.filter(page => !page.parent_id);
  }, [pages]);

  const getChildPagesFor = useCallback((parentId: string): Page[] => {
    return pages.filter(page => page.parent_id === parentId);
  }, [pages]);

  return {
    // Data
    pages,
    currentPage,
    filteredPages,
    homePage,
    childPages,
    filters,
    
    // Status
    status,
    filteredStatus,
    currentPageStatus,
    error,
    isLoading,
    isFiltering,
    hasError,
    hasPages,
    hasFilteredPages,
    
    // Actions
    loadPages,
    loadPageById,
    loadPageBySlug,
    loadHomePage,
    loadFilteredPages,
    loadChildPages,
    createNewPage,
    updateExistingPage,
    removePage: removepágina,
    updateFilters,
    addToFilters,
    resetFilters,
    clearAllPages,
    setPage,
    
    // Helpers
    getPageBySlug,
    getPageById,
    getPublishedPages,
    getDraftPages,
    getPagesByTemplate,
    getRootPages,
    getChildPagesFor
  };
};

export default usePages;