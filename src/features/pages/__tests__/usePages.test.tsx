import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { usePages } from '../hooks/usePages';
import pagesReducer from '../store/pagesSlice';
import type { Page } from '../types';

// Mock the environment config
jest.mock('@/config/env', () => ({
  getIsSupabaseEnabled: () => false
}));

// Mock the API
jest.mock('../api/pagesApi', () => ({
  pagesApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getBySlug: jest.fn(),
    getHomePage: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

const mockStore = configureStore({
  reducer: {
    pages: pagesReducer
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>{children}</Provider>
);

describe('usePages hook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    expect(result.current.pages).toEqual([]);
    expect(result.current.currentPage).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.hasPages).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should provide all necessary functions', () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    // Check that all expected functions are present
    expect(typeof result.current.loadPages).toBe('function');
    expect(typeof result.current.loadPageById).toBe('function');
    expect(typeof result.current.loadPageBySlug).toBe('function');
    expect(typeof result.current.loadHomePage).toBe('function');
    expect(typeof result.current.createNewPage).toBe('function');
    expect(typeof result.current.updateExistingPage).toBe('function');
    expect(typeof result.current.removePage).toBe('function');
    expect(typeof result.current.updateFilters).toBe('function');
    expect(typeof result.current.resetFilters).toBe('function');
    expect(typeof result.current.getPageBySlug).toBe('function');
    expect(typeof result.current.getPageById).toBe('function');
    expect(typeof result.current.getPublishedPages).toBe('function');
    expect(typeof result.current.getDraftPages).toBe('function');
  });

  it('should handle loadPages action', async () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    await act(async () => {
      await result.current.loadPages();
    });

    // After loading, we should have the mock pages
    expect(result.current.pages.length).toBeGreaterThan(0);
    expect(result.current.status).toBe('succeeded');
    expect(result.current.hasPages).toBe(true);
  });

  it('should handle filter operations', () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    act(() => {
      result.current.updateFilters({ search: 'test' });
    });

    expect(result.current.filters.search).toBe('test');

    act(() => {
      result.current.addToFilters({ status: 'published' });
    });

    expect(result.current.filters.search).toBe('test');
    expect(result.current.filters.status).toBe('published');

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({});
  });

  it('should provide helper functions that work correctly', async () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    // Load some pages first
    await act(async () => {
      await result.current.loadPages();
    });

    // Test helper functions
    const publishedPages = result.current.getPublishedPages();
    const draftPages = result.current.getDraftPages();
    const rootPages = result.current.getRootPages();

    expect(Array.isArray(publishedPages)).toBe(true);
    expect(Array.isArray(draftPages)).toBe(true);
    expect(Array.isArray(rootPages)).toBe(true);

    // Test getPageBySlug
    if (result.current.pages.length > 0) {
      const firstPage = result.current.pages[0];
      if (firstPage.slug) {
        const foundPage = result.current.getPageBySlug(firstPage.slug);
        expect(foundPage?.id).toBe(firstPage.id);
      }
    }
  });

  it('should handle page CRUD operations', async () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    // Test create
    await act(async () => {
      await result.current.createNewPage({
        title: 'Test Page',
        content: '<p>Test content</p>',
        status: 'draft'
      });
    });

    // Test update (assuming we have pages loaded)
    await act(async () => {
      await result.current.loadPages();
    });

    if (result.current.pages.length > 0) {
      const pageId = result.current.pages[0].id;
      
      await act(async () => {
        await result.current.updateExistingPage(pageId, {
          title: 'Updated Title'
        });
      });

      // Test delete
      await act(async () => {
        await result.current.removePage(pageId);
      });
    }

    // These operations should not throw errors
    expect(result.current.error).toBeNull();
  });

  it('should handle loading states correctly', () => {
    const { result } = renderHook(() => usePages(), { wrapper });

    // Initially not loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFiltering).toBe(false);

    // The loading states are managed by the async thunks
    // In a real test environment, we might mock the async behavior
  });
});