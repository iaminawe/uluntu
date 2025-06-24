import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { NewsArticle, ContentStatus } from '@/types';
import { newsApi } from '../api/newsApi';
import { getIsSupabaseEnabled } from '@/config/env';
import mockData from '@/data/mock/mockData';

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
  filteredStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
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
  filteredStatus: 'idle',
  error: null
};

// Async thunks
export const fetchNewsArticles = createAsyncThunk(
  'news/fetchNewsArticles',
  async (_, { rejectWithValue }) => {
    try {
      
      console.log('[NewsSlice] Fetching from Supabase...');
      const articles = await newsApi.getAll();
      console.log('[NewsSlice] Received articles:', articles?.length || 0);
      return articles || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch news articles');
    }
  }
);

export const fetchNewsArticleById = createAsyncThunk(
  'news/fetchNewsArticleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const article = await newsApi.getById(id);
      return article || null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch news article with ID: ${id}`);
    }
  }
);

export const fetchNewsArticleBySlug = createAsyncThunk(
  'news/fetchNewsArticleBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      if (getIsSupabaseEnabled()) {
        const article = await newsApi.getBySlug(slug);
        return article || null;
      } else {
        // Mock implementation - find article by slug
        const article = mockData.newsArticles.find(a => a.slug === slug);
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
      if (getIsSupabaseEnabled()) {
        const articles = await newsApi.getAll(filters);
        return articles;
      } else {
        // Mock filtering logic
        let filteredArticles = mockData.newsArticles || [];
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredArticles = filteredArticles.filter(article =>
            article.title.toLowerCase().includes(searchTerm) ||
            (article.content && article.content.toLowerCase().includes(searchTerm))
          );
        }
        
        if (filters.tags && filters.tags.length > 0) {
          filteredArticles = filteredArticles.filter(article =>
            article.tags && filters.tags!.some(tag => article.tags!.includes(tag))
          );
        }
        
        if (filters.featured !== undefined) {
          filteredArticles = filteredArticles.filter(article => article.featured === filters.featured);
        }
        
        if (filters.status) {
          filteredArticles = filteredArticles.filter(article => article.status === filters.status);
        }
        
        const articles = filteredArticles;
        return articles;
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
      if (getIsSupabaseEnabled()) {
        return await newsApi.getRelated(id, limit);
      } else {
        const article = mockData.newsArticles.find(a => a.id === id);
        if (!article) return [];
        
        // Find related articles based on shared tags
        const relatedArticles = mockData.newsArticles
          .filter(a => a.id !== id && a.tags && article.tags && 
            a.tags.some(tag => article.tags!.includes(tag)))
          .slice(0, limit);
        
        return relatedArticles;
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
      if (getIsSupabaseEnabled()) {
        return await newsApi.getAll({ featured: true });
      } else {
        const articles = mockData.newsArticles.filter(a => a.featured === true);
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
      if (getIsSupabaseEnabled()) {
        const newArticle = await newsApi.create(articleData);
        return newArticle;
      } else {
        // Create a mock article with the data provided
        const newArticle = {
          id: Date.now().toString(),
          title: articleData.title,
          slug: articleData.slug || articleData.title.toLowerCase().replace(/\s+/g, '-'),
          content: articleData.content || '',
          excerpt: articleData.excerpt || '',
          author_id: articleData.author_id || 'mock-author',
          publish_date: articleData.publish_date || new Date().toISOString().split('T')[0],
          hero_image: articleData.hero_image || '',
          tags: articleData.tags || [],
          status: articleData.status || 'published',
          featured: articleData.featured || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return newArticle as any;
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
      if (getIsSupabaseEnabled()) {
        const updatedArticle = await newsApi.update(id, data);
        return updatedArticle;
      } else {
        // Update a mock article with the data provided
        const existingArticle = mockData.newsArticles.find(a => a.id === id);
        if (existingArticle) {
          const updatedArticle = { ...existingArticle, ...data, updatedAt: new Date().toISOString() };
          return updatedArticle as any;
        }
        throw new Error(`News article with ID ${id} not found`);
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
      if (getIsSupabaseEnabled()) {
        const success = await newsApi.delete(id);
        if (success) {
          return id;
        }
        throw new Error(`Failed to delete news article with ID: ${id}`);
      } else {
        // Mock delete - just return the id to indicate success
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
    mergeFilters(state, action: PayloadAction<Partial<NewsFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
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
      state.filteredStatus = 'idle';
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
        state.articles = action.payload as any;
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
        state.currentArticle = action.payload as any;
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
        state.currentArticle = action.payload as any;
        state.error = null;
      })
      .addCase(fetchNewsArticleBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchFilteredNewsArticles
      .addCase(fetchFilteredNewsArticles.pending, (state) => {
        state.filteredStatus = 'loading';
      })
      .addCase(fetchFilteredNewsArticles.fulfilled, (state, action) => {
        state.filteredStatus = 'succeeded';
        state.filteredArticles = action.payload as any;
        state.error = null;
      })
      .addCase(fetchFilteredNewsArticles.rejected, (state, action) => {
        state.filteredStatus = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchRelatedNewsArticles
      .addCase(fetchRelatedNewsArticles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRelatedNewsArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.relatedArticles = action.payload as any;
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
        state.featuredArticles = action.payload as any;
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
            state.currentArticle = action.payload as any;
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
export const { setFilters, mergeFilters, clearFilters, clearNews } = newsSlice.actions;
export { newsSlice };
export default newsSlice.reducer;

// Selectors
export const selectAllNewsArticles = (state: RootState) => state.news.articles;
export const selectCurrentNewsArticle = (state: RootState) => state.news.currentArticle;
export const selectFilteredNewsArticles = (state: RootState) => state.news.filteredArticles;
export const selectRelatedNewsArticles = (state: RootState) => state.news.relatedArticles;
export const selectFeaturedNewsArticles = (state: RootState) => state.news.featuredArticles;
export const selectNewsStatus = (state: RootState) => state.news.status;
export const selectFilteredNewsStatus = (state: RootState) => state.news.filteredStatus;
export const selectNewsError = (state: RootState) => state.news.error;
export const selectNewsFilters = (state: RootState) => state.news.filters;
