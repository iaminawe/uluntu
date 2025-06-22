import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pagesApi } from '../api/pagesApi';
import { Page, PagesState, PageFilters, CreatePageData, UpdatePageData } from '../types';

const initialState: PagesState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    sort_by: 'updated_at',
    sort_order: 'desc',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async (params?: { filters?: PageFilters; page?: number; limit?: number }) => {
    const response = await pagesApi.getPages(params);
    return response;
  }
);

export const fetchPageById = createAsyncThunk(
  'pages/fetchPageById',
  async (id: string) => {
    const response = await pagesApi.getPageById(id);
    return response;
  }
);

export const fetchPageBySlug = createAsyncThunk(
  'pages/fetchPageBySlug',
  async (slug: string) => {
    const response = await pagesApi.getPageBySlug(slug);
    return response;
  }
);

export const createPage = createAsyncThunk(
  'pages/createPage',
  async (pageData: CreatePageData) => {
    const response = await pagesApi.createPage(pageData);
    return response;
  }
);

export const updatePage = createAsyncThunk(
  'pages/updatePage',
  async (pageData: UpdatePageData) => {
    const response = await pagesApi.updatePage(pageData);
    return response;
  }
);

export const deletePage = createAsyncThunk(
  'pages/deletePage',
  async (id: string) => {
    await pagesApi.deletePage(id);
    return id;
  }
);

export const publishPage = createAsyncThunk(
  'pages/publishPage',
  async (id: string) => {
    const response = await pagesApi.publishPage(id);
    return response;
  }
);

export const unpublishPage = createAsyncThunk(
  'pages/unpublishPage',
  async (id: string) => {
    const response = await pagesApi.unpublishPage(id);
    return response;
  }
);

export const fetchHomePage = createAsyncThunk(
  'pages/fetchHomePage',
  async () => {
    const response = await pagesApi.getHomePage();
    return response;
  }
);

export const fetchFilteredPages = createAsyncThunk(
  'pages/fetchFilteredPages',
  async (filters: PageFilters) => {
    const response = await pagesApi.getPages({ filters });
    return response;
  }
);

export const fetchChildPages = createAsyncThunk(
  'pages/fetchChildPages',
  async (parentId: string) => {
    const response = await pagesApi.getChildPages(parentId);
    return response;
  }
);

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PageFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    mergeFilters: (state, action: PayloadAction<Partial<PageFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        sort_by: 'updated_at',
        sort_order: 'desc',
      };
    },
    
    setCurrentPage: (state, action: PayloadAction<Page | null>) => {
      state.currentPage = action.payload;
    },
    
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
    
    setPagination: (state, action: PayloadAction<Partial<PagesState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearPages: (state) => {
      state.pages = [];
      state.currentPage = null;
      state.error = null;
      state.pagination = {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      };
    },
    
    // Optimistic updates
    optimisticUpdatePage: (state, action: PayloadAction<UpdatePageData>) => {
      const { id, ...updates } = action.payload;
      const index = state.pages.findIndex(page => page.id === id);
      if (index !== -1) {
        state.pages[index] = { ...state.pages[index], ...updates, updated_at: new Date().toISOString() };
      }
      if (state.currentPage?.id === id) {
        state.currentPage = { ...state.currentPage, ...updates, updated_at: new Date().toISOString() };
      }
    },
    
    optimisticDeletePage: (state, action: PayloadAction<string>) => {
      state.pages = state.pages.filter(page => page.id !== action.payload);
      if (state.currentPage?.id === action.payload) {
        state.currentPage = null;
      }
    },
  },
  
  extraReducers: (builder) => {
    // Fetch pages
    builder
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pages';
      });

    // Fetch page by ID
    builder
      .addCase(fetchPageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload;
      })
      .addCase(fetchPageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch page';
      });

    // Fetch page by slug
    builder
      .addCase(fetchPageBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPageBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload;
      })
      .addCase(fetchPageBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch page';
      });

    // Create page
    builder
      .addCase(createPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.loading = false;
        state.pages.unshift(action.payload);
        state.currentPage = action.payload;
      })
      .addCase(createPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create page';
      });

    // Update page
    builder
      .addCase(updatePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pages.findIndex(page => page.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = action.payload;
        }
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update page';
      });

    // Delete page
    builder
      .addCase(deletePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = state.pages.filter(page => page.id !== action.payload);
        if (state.currentPage?.id === action.payload) {
          state.currentPage = null;
        }
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete page';
      });

    // Publish page
    builder
      .addCase(publishPage.fulfilled, (state, action) => {
        const index = state.pages.findIndex(page => page.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = action.payload;
        }
      });

    // Unpublish page
    builder
      .addCase(unpublishPage.fulfilled, (state, action) => {
        const index = state.pages.findIndex(page => page.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = action.payload;
        }
      });
  },
});

export const {
  setFilters,
  mergeFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentPage,
  setPagination,
  clearError,
  clearPages,
  optimisticUpdatePage,
  optimisticDeletePage,
} = pagesSlice.actions;

// Selectors
export const selectAllPages = (state: { pages: PagesState }) => state.pages.pages;
export const selectCurrentPage = (state: { pages: PagesState }) => state.pages.currentPage;
export const selectFilteredPages = (state: { pages: PagesState }) => {
  const { pages, filters } = state.pages;
  
  return pages.filter(page => {
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'published' && page.status !== 'published') return false;
      if (filters.status === 'draft' && page.status !== 'draft') return false;
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = page.title.toLowerCase().includes(searchLower);
      const contentMatch = page.content && page.content.toLowerCase().includes(searchLower);
      if (!titleMatch && !contentMatch) return false;
    }
    
    // Filter by template
    if (filters.template && page.template !== filters.template) return false;
    
    return true;
  });
};

export const selectHomePage = (state: { pages: PagesState }) => 
  state.pages.pages.find(page => page.slug === 'home' || page.is_homepage);

export const selectChildPages = (state: { pages: PagesState }) => 
  state.pages.pages.filter(page => !!page.parent_id);

export const selectPagesStatus = (state: { pages: PagesState }) => 
  state.pages.loading ? 'loading' : state.pages.error ? 'error' : 'success';

export const selectFilteredPagesStatus = (state: { pages: PagesState }) => 
  state.pages.loading ? 'loading' : state.pages.error ? 'error' : 'success';

export const selectCurrentPageStatus = (state: { pages: PagesState }) => 
  state.pages.loading ? 'loading' : state.pages.error ? 'error' : 'success';

export const selectPagesError = (state: { pages: PagesState }) => state.pages.error;

export const selectPagesFilters = (state: { pages: PagesState }) => state.pages.filters;

export default pagesSlice.reducer;