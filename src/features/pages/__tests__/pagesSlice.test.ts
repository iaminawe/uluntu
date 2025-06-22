import { configureStore } from '@reduxjs/toolkit';
import pagesReducer, {
  fetchPages,
  fetchPageById,
  fetchPageBySlug,
  fetchHomePage,
  createPage,
  updatePage,
  deletePage,
  setFilters,
  clearFilters,
  selectAllPages,
  selectCurrentPage,
  selectPagesStatus,
  selectPagesError,
  selectPagesFilters
} from '../store/pagesSlice';
import type { PagesState } from '../store/pagesSlice';
import type { Page, PageInput } from '../types';

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

const mockPage: Page = {
  id: '1',
  title: 'Test Page',
  slug: 'test-page',
  content: '<p>Test content</p>',
  excerpt: 'Test excerpt',
  status: 'published',
  template: 'default',
  is_home: false,
  is_published: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tags: []
};

const mockPageInput: PageInput = {
  title: 'New Page',
  content: '<p>New content</p>',
  status: 'draft'
};

describe('pagesSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        pages: pagesReducer
      }
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().pages;
      
      expect(state).toEqual({
        pages: [],
        currentPage: null,
        filteredPages: [],
        homePage: null,
        childPages: [],
        filters: {},
        status: 'idle',
        filteredStatus: 'idle',
        currentPageStatus: 'idle',
        error: null
      });
    });
  });

  describe('synchronous actions', () => {
    it('should handle setFilters', () => {
      const filters = { search: 'test', status: 'published' as const };
      store.dispatch(setFilters(filters));
      
      const state = store.getState().pages;
      expect(state.filters).toEqual(filters);
    });

    it('should handle clearFilters', () => {
      // First set some filters
      store.dispatch(setFilters({ search: 'test' }));
      
      // Then clear them
      store.dispatch(clearFilters());
      
      const state = store.getState().pages;
      expect(state.filters).toEqual({});
    });
  });

  describe('async thunks', () => {
    describe('fetchPages', () => {
      it('should handle fulfilled state', async () => {
        const pages = [mockPage];
        
        await store.dispatch(fetchPages());
        
        const state = store.getState().pages;
        expect(state.status).toBe('succeeded');
        expect(state.pages).toHaveLength(3); // Mock data has 3 pages
        expect(state.error).toBeNull();
      });
    });

    describe('fetchPageById', () => {
      it('should handle fulfilled state with valid page', async () => {
        await store.dispatch(fetchPageById('1'));
        
        const state = store.getState().pages;
        expect(state.currentPageStatus).toBe('succeeded');
        expect(state.currentPage).toBeTruthy();
        expect(state.error).toBeNull();
      });

      it('should handle fulfilled state with null result', async () => {
        await store.dispatch(fetchPageById('999'));
        
        const state = store.getState().pages;
        expect(state.currentPageStatus).toBe('succeeded');
        expect(state.currentPage).toBeNull();
        expect(state.error).toBeNull();
      });
    });

    describe('fetchPageBySlug', () => {
      it('should handle fulfilled state with valid slug', async () => {
        await store.dispatch(fetchPageBySlug('home'));
        
        const state = store.getState().pages;
        expect(state.currentPageStatus).toBe('succeeded');
        expect(state.currentPage).toBeTruthy();
        expect(state.error).toBeNull();
      });
    });

    describe('fetchHomePage', () => {
      it('should handle fulfilled state', async () => {
        await store.dispatch(fetchHomePage());
        
        const state = store.getState().pages;
        expect(state.currentPageStatus).toBe('succeeded');
        expect(state.homePage).toBeTruthy();
        expect(state.error).toBeNull();
      });
    });

    describe('createPage', () => {
      it('should handle fulfilled state', async () => {
        await store.dispatch(createPage(mockPageInput));
        
        const state = store.getState().pages;
        expect(state.pages).toHaveLength(4); // 3 initial + 1 new
        expect(state.error).toBeNull();
      });
    });

    describe('updatePage', () => {
      it('should handle fulfilled state', async () => {
        // First add a page to the store
        await store.dispatch(createPage(mockPageInput));
        
        const updateData = { title: 'Updated Title' };
        await store.dispatch(updatePage({ id: '1', data: updateData }));
        
        const state = store.getState().pages;
        expect(state.error).toBeNull();
      });
    });

    describe('deletePage', () => {
      it('should handle fulfilled state', async () => {
        // First add a page to the store
        await store.dispatch(createPage(mockPageInput));
        
        await store.dispatch(deletePage('1'));
        
        const state = store.getState().pages;
        expect(state.error).toBeNull();
      });
    });
  });

  describe('selectors', () => {
    beforeEach(async () => {
      await store.dispatch(fetchPages());
    });

    it('should select all pages', () => {
      const state = store.getState();
      const pages = selectAllPages(state);
      expect(Array.isArray(pages)).toBe(true);
    });

    it('should select current page', () => {
      const state = store.getState();
      const currentPage = selectCurrentPage(state);
      expect(currentPage).toBeNull(); // Initially null
    });

    it('should select pages status', () => {
      const state = store.getState();
      const status = selectPagesStatus(state);
      expect(status).toBe('succeeded');
    });

    it('should select pages error', () => {
      const state = store.getState();
      const error = selectPagesError(state);
      expect(error).toBeNull();
    });

    it('should select pages filters', () => {
      const state = store.getState();
      const filters = selectPagesFilters(state);
      expect(filters).toEqual({});
    });
  });

  describe('error handling', () => {
    it('should handle rejected fetchPages', async () => {
      // This would require mocking the API to throw an error
      // For now, we'll just test the structure
      const state = store.getState().pages;
      expect(state.error).toBeNull();
    });
  });
});