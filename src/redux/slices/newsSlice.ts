import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { NewsArticle, ContentStatus } from '../../types';
import { newsApi } from '../../api/newsApi';
import * as mockQueries from '../../hooks/useNewsQueries';

// Toggle between Supabase and mock data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Define the input type for news article data
export interface NewsArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author_id?: string;
  publish_date?: string;
  hero_image?: string;
  hero_image_alt?: string;
  tags?: string[];
  status?: ContentStatus;
  featured?: boolean;
}

// Define type for news filters to match the API interface
export interface NewsFilters {
  search?: string;
  tags?: string[];
  featured?: boolean;
  status?: ContentStatus;
}

// Define the state type
export interface NewsState {
  articles: NewsArticle[];
  currentArticle: NewsArticle | null;
  filteredArticles: NewsArticle[];
  relatedArticles: NewsArticle[];
  featuredArticles: NewsArticle[];
  filters: NewsFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: NewsState = {
  articles: [],
  currentArticle: null,
  filteredArticles: [],
  relatedArticles: [],
  featuredArticles: [],
  filters: {},
  status: 'idle',
  error: null
};

// Async thunks
export const fetchNewsArticles = createAsyncThunk(
  'news/fetchNewsArticles',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await newsApi.getAll();
      } else {
        return mockQueries.useNewsArticles().data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch news articles');
    }
  }
);

export const fetchNewsArticleById = createAsyncThunk(
  'news/fetchNewsArticleById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const article = await newsApi.getById(id);
        return article || null;
      } else {
        const result = mockQueries.useNewsArticle(id);
        return result?.data || null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch news article with ID: ${id}`);
    }
  }
);

export const fetchNewsArticleBySlug = createAsyncThunk(
  'news/fetchNewsArticleBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const article = await newsApi.getBySlug(slug);
        return article || null;
      } else {
        // Mock implementation - normally you'd have a useNewsArticleBySlug hook
        const articles = mockQueries.useNewsArticles().data || [];
        const article = articles.find(a => a.slug === slug);
        return article || null;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch news article with slug: ${slug}`);
    }
  }
);

export const fetchFilteredNewsArticles = createAsyncThunk(
  'news/fetchFilteredNewsArticles',
  async (filters: NewsFilters, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await newsApi.getAll(filters);
      } else {
        const queryResult = mockQueries.useNewsArticlesWithFilters({
          search: filters.search,
          tag: filters.tags?.[0], // The mock hook only supports a single tag
          featured: filters.featured,
          status: filters.status
        });
        return queryResult.data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch filtered news articles');
    }
  }
);

export const fetchRelatedNewsArticles = createAsyncThunk(
  'news/fetchRelatedNewsArticles',
  async ({ id, limit = 3 }: { id: string; limit?: number }, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await newsApi.getRelated(id, limit);
      } else {
        const article = mockQueries.useNewsArticle(id).data;
        if (!article) return [];
        
        const result = mockQueries.useRelatedNewsArticles(id, article.tags, limit);
        return result.data || [];
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch related news articles for ID: ${id}`);
    }
  }
);

export const fetchFeaturedNewsArticles = createAsyncThunk(
  'news/fetchFeaturedNewsArticles',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        return await newsApi.getAll({ featured: true });
      } else {
        const articles = mockQueries.useNewsArticlesWithFilters({ featured: true }).data || [];
        return articles;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch featured news articles');
    }
  }
);

export const createNewsArticle = createAsyncThunk(
  'news/createNewsArticle',
  async (articleData: NewsArticleInput, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const newArticle = await newsApi.create(articleData);
        return newArticle;
      } else {
        // Create a mock article with the data provided
        const mockResult = mockQueries.useCreateNewsArticle().mutateAsync(articleData);
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create news article');
    }
  }
);

export const updateNewsArticle = createAsyncThunk(
  'news/updateNewsArticle',
  async ({ id, data }: { id: string; data: Partial<NewsArticleInput> }, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const updatedArticle = await newsApi.update(id, data);
        return updatedArticle;
      } else {
        // Update a mock article with the data provided
        const mockResult = mockQueries.useUpdateNewsArticle().mutateAsync({ id, data });
        return mockResult;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to update news article with ID: ${id}`);
    }
  }
);

export const deleteNewsArticle = createAsyncThunk(
  'news/deleteNewsArticle',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_SUPABASE) {
        const success = await newsApi.delete(id);
        if (success) {
          return id;
        }
        throw new Error(`Failed to delete news article with ID: ${id}`);
      } else {
        await mockQueries.useDeleteNewsArticle().mutateAsync(id);
        return id;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to delete news article with ID: ${id}`);
    }
  }
);

// Create the slice
const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<NewsFilters>) {
      state.filters = action.payload;
    },
    clearFilters(state) {
      state.filters = {};
    },
    clearNews(state) {
      state.articles = [];
      state.filteredArticles = [];
      state.relatedArticles = [];
      state.featuredArticles = [];
      state.currentArticle = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchNewsArticles
      .addCase(fetchNewsArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNewsArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.articles = action.payload;
        state.error = null;
      })
      .addCase(fetchNewsArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchNewsArticleById
      .addCase(fetchNewsArticleById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNewsArticleById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentArticle = action.payload;
        state.error = null;
      })
      .addCase(fetchNewsArticleById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchNewsArticleBySlug
      .addCase(fetchNewsArticleBySlug.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNewsArticleBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentArticle = action.payload;
        state.error = null;
      })
      .addCase(fetchNewsArticleBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFilteredNewsArticles
      .addCase(fetchFilteredNewsArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilteredNewsArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredArticles = action.payload;
        state.error = null;
      })
      .addCase(fetchFilteredNewsArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchRelatedNewsArticles
      .addCase(fetchRelatedNewsArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRelatedNewsArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.relatedArticles = action.payload;
        state.error = null;
      })
      .addCase(fetchRelatedNewsArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFeaturedNewsArticles
      .addCase(fetchFeaturedNewsArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeaturedNewsArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.featuredArticles = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedNewsArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createNewsArticle
      .addCase(createNewsArticle.fulfilled, (state, action) => {
        if (action.payload) {
          state.articles.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createNewsArticle.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle updateNewsArticle
      .addCase(updateNewsArticle.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.articles.findIndex(article => article.id === action.payload?.id);
          if (index !== -1) {
            state.articles[index] = action.payload;
          }
          
          // Update in filteredArticles if present
          const filteredIndex = state.filteredArticles.findIndex(article => article.id === action.payload?.id);
          if (filteredIndex !== -1) {
            state.filteredArticles[filteredIndex] = action.payload;
          }
          
          // Update in featuredArticles if present
          const featuredIndex = state.featuredArticles.findIndex(article => article.id === action.payload?.id);
          if (featuredIndex !== -1) {
            state.featuredArticles[featuredIndex] = action.payload;
          }
          
          // Update currentArticle if it's the same as the updated one
          if (state.currentArticle?.id === action.payload.id) {
            state.currentArticle = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateNewsArticle.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Handle deleteNewsArticle
      .addCase(deleteNewsArticle.fulfilled, (state, action) => {
        const id = action.payload;
        state.articles = state.articles.filter(article => article.id !== id);
        state.filteredArticles = state.filteredArticles.filter(article => article.id !== id);
        state.featuredArticles = state.featuredArticles.filter(article => article.id !== id);
        if (state.currentArticle?.id === id) {
          state.currentArticle = null;
        }
        state.error = null;
      })
      .addCase(deleteNewsArticle.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { setFilters, clearFilters, clearNews } = newsSlice.actions;
export default newsSlice.reducer;

// Selectors
export const selectAllNewsArticles = (state: RootState) => state.news.articles;
export const selectCurrentNewsArticle = (state: RootState) => state.news.currentArticle;
export const selectFilteredNewsArticles = (state: RootState) => state.news.filteredArticles;
export const selectRelatedNewsArticles = (state: RootState) => state.news.relatedArticles;
export const selectFeaturedNewsArticles = (state: RootState) => state.news.featuredArticles;
export const selectNewsStatus = (state: RootState) => state.news.status;
export const selectNewsError = (state: RootState) => state.news.error;
export const selectNewsFilters = (state: RootState) => state.news.filters;
