import { useMutation, useQuery, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import mockData from '../data/mock/mockData';
import { supabase } from '../lib/supabase';
import type { Tables } from '../../types/supabase'; // Assuming this path and type exist

// Redefined NewsArticle type based on mock data and common fields, aligned with consuming components
export type NewsArticle = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string; // Assuming content is always a string based on usage, adjust if nullable
  author_id: string | null;
  author_name?: string;
  author_image?: string;
  publish_date: string; // Renamed from published_at
  hero_image: string | null; // Renamed from image_url
  hero_image_alt: string | null;
  tags: string[] | null;
  status: string | null;
  featured: boolean | null;
};

export type NewsArticleInput = {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content?: string; // Assuming content is always a string
  author_id?: string | null;
  publish_date?: string | null;
  hero_image?: string | null;
  hero_image_alt?: string | null;
  tags?: string[] | null;
  status?: string | null;
  featured?: boolean | null;
};

// Supabase news table types
type SupabaseNewsArticle = Tables<'news'>['Row'] & {
  // These fields might come from joins or be denormalized in your Supabase setup
  // If they don't exist in your schema, they'll be undefined
  author_name?: string;
  author_image?: string;
};
type SupabaseNewsArticleInsert = Tables<'news'>['Insert'];

// Adapter function to map Supabase news_articles row to internal NewsArticle type
function mapSupabaseNewsToInternalNews(supabaseItem: SupabaseNewsArticle): NewsArticle {
  // This mapping is an assumption and needs to align with your actual Supabase table structure
  return {
    id: String(supabaseItem.id), // Assuming id might be number in Supabase, string in NewsArticle
    created_at: supabaseItem.created_at,
    updated_at: supabaseItem.updated_at || supabaseItem.created_at, // Fallback for updated_at
    title: supabaseItem.title || '',
    slug: supabaseItem.slug || null,
    excerpt: supabaseItem.excerpt || null,
    content: supabaseItem.content || '',
    author_id: supabaseItem.author_id ? String(supabaseItem.author_id) : null,
    // author_name and author_image might come from a join or be denormalized.
    // These might not be directly on the news_articles table or could be handled by a view/RPC.
    // If they are direct columns, ensure SupabaseNewsArticle type includes them.
    author_name: supabaseItem.author_name || undefined, // Now properly typed in SupabaseNewsArticle
    author_image: supabaseItem.author_image || undefined, // Now properly typed in SupabaseNewsArticle
    publish_date: supabaseItem.publish_date || supabaseItem.created_at,
    hero_image: supabaseItem.hero_image || null,
    hero_image_alt: supabaseItem.hero_image_alt || supabaseItem.title || null,
    tags: supabaseItem.tags || null, // Assuming tags is an array of strings in Supabase
    status: supabaseItem.status || null,
    featured: supabaseItem.featured || false,
  };
}

// Adapter function to map NewsArticleInput to Supabase insert type
function mapInternalNewsInputToSupabase(input: NewsArticleInput): SupabaseNewsArticleInsert {
  // This mapping is an assumption and needs to align with your actual Supabase table schema
  // Ensure that types match what Supabase expects (e.g., author_id might be number)
  const supabaseInsert: SupabaseNewsArticleInsert = {
    title: input.title,
    slug: input.slug || null,
    excerpt: input.excerpt || null,
    content: input.content || '', // Ensure content is string as per NewsArticleInput
    // author_id: input.author_id ? parseInt(input.author_id, 10) : null, // Example if Supabase expects number
    author_id: input.author_id || null, // Assuming author_id is compatible or string in Supabase too for now
    publish_date: input.publish_date || new Date().toISOString(), // Default to now if not provided
    hero_image: input.hero_image || null,
    hero_image_alt: input.hero_image_alt || null,
    tags: input.tags || null,
    status: input.status || 'draft', // Default status to 'draft'
    featured: input.featured || false,
    // created_at and updated_at are typically handled by Supabase defaults
  };
  // Remove undefined properties as Supabase might not like them for inserts
  Object.keys(supabaseInsert).forEach(key => {
    const k = key as keyof SupabaseNewsArticleInsert;
    if (supabaseInsert[k] === undefined) {
      delete supabaseInsert[k];
    }
  });
  return supabaseInsert;
}

// Original mapMockNewsToInternalNews function, ensure it's placed before its first use or hoisted if necessary.
function mapMockNewsToInternalNews(mockItem: typeof mockData.newsArticles[0]): NewsArticle {
  return {
    id: String(mockItem.id),
    created_at: mockItem.publishedAt, // Or a more distinct created_at if available
    updated_at: mockItem.publishedAt, // Or new Date().toISOString() for a more accurate updated_at for mock
    title: mockItem.title,
    slug: mockItem.slug ?? null,
    excerpt: mockItem.excerpt ?? null,
    content: mockItem.content ?? '', // Ensure content is string
    author_id: mockItem.author ? String(mockItem.author.id) : null,
    author_name: mockItem.author?.name,
    author_image: mockItem.author?.image,
    publish_date: mockItem.publishedAt,
    hero_image: mockItem.image ?? null,
    hero_image_alt: mockItem.title, // Placeholder for alt text
    tags: mockItem.tags ?? null,
    status: mockItem.status as string ?? null,
    featured: mockItem.featured ?? false,
  };
}

// NewsArticle Hooks

export function useNewsArticlesWithFilters(filters?: {
  search?: string;
  tags?: string[];
  // Add other relevant filters for news
}): UseQueryResult<NewsArticle[], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<NewsArticle[], Error>({
    queryKey: ['newsArticles', 'filtered', filters, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (useSupabase) {
        try {
          let query = supabase.from('news').select('*');

          if (filters?.search) {
            // Using ilike for case-insensitive search. For more complex search, consider full-text search.
            query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
          }

          if (filters?.tags && filters.tags.length > 0) {
            // Assuming 'tags' is an array column in Supabase that can be queried with 'cs' (contains)
            query = query.filter('tags', 'cs', `{${filters.tags.join(',')}}`);
          }
          
          // Add other filters as needed, e.g., by status, featured, etc.
          // query = query.order('publish_date', { ascending: false }); // Example ordering

          const { data: supabaseNews, error } = await query;

          if (error) {
            console.error('Error fetching news articles from Supabase:', error);
            throw error;
          }
          return supabaseNews ? supabaseNews.map(mapSupabaseNewsToInternalNews) : [];
        } catch (error) {
          console.error('Supabase query failed for news articles:', error);
          // Fallback to mock data or return empty array if critical
          // For now, rethrow or return empty to indicate failure to fetch from Supabase
          if (error instanceof Error) throw error;
          throw new Error('Failed to fetch news articles from Supabase');
        }
      }
      // Fallback to mock data if useSupabase is false
      let mappedMockNews = mockData.newsArticles.map(mapMockNewsToInternalNews);
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        mappedMockNews = mappedMockNews.filter(article =>
          article.title.toLowerCase().includes(searchTerm) ||
          (article.content && article.content.toLowerCase().includes(searchTerm)) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm))
        );
      }
      if (filters?.tags && filters.tags.length > 0) {
        mappedMockNews = mappedMockNews.filter(article =>
          article.tags && filters.tags?.every(tag => article.tags!.includes(tag))
        );
      }
      // Add other filters as needed
      return mappedMockNews;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewsArticle(id: string | undefined): UseQueryResult<NewsArticle | undefined, Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  return useQuery<NewsArticle | undefined, Error>({
    queryKey: ['newsArticle', id, useSupabase ? 'supabase' : 'mock'],
    queryFn: async (): Promise<NewsArticle | undefined> => {
      if (!id) return undefined;

      if (useSupabase) {
        try {
          const { data: supabaseNews, error } = await supabase
            .from('news')
            .select('*')
            .eq('id', id) // Assuming 'id' in Supabase is a number if your 'id' param is string and needs conversion, adjust accordingly
            .single();

          if (error) {
            // It's common for .single() to throw an error if no row is found or multiple are found.
            // You might want to handle PGRST116 (no rows) specifically as 'not found' rather than a generic error.
            if (error.code === 'PGRST116') {
              console.log(`News article with id ${id} not found in Supabase.`);
              return undefined;
            }
            console.error(`Error fetching news article ${id} from Supabase:`, error);
            throw error;
          }
          return supabaseNews ? mapSupabaseNewsToInternalNews(supabaseNews) : undefined;
        } catch (error) {
          console.error(`Supabase query failed for news article ${id}:`, error);
          if (error instanceof Error) throw error;
          throw new Error('Failed to fetch news article from Supabase');
        }
      }

      // Fallback to mock data
      const foundArticle = mockData.newsArticles.find(article => String(article.id) === id);
      return foundArticle ? mapMockNewsToInternalNews(foundArticle) : undefined;
    },
    enabled: !!id, // Only run the query if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateNewsArticle(): UseMutationResult<NewsArticle | null, Error, NewsArticleInput> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<NewsArticle | null, Error, NewsArticleInput>({
    mutationFn: async (data: NewsArticleInput): Promise<NewsArticle | null> => {
      if (useSupabase) {
        try {
          const supabaseData = mapInternalNewsInputToSupabase(data);
          const { data: createdNewsArticle, error } = await supabase
            .from('news')
            .insert(supabaseData)
            .select()
            .single(); // Assuming you want the created record back

          if (error) {
            console.error('Error creating news article in Supabase:', error);
            throw error;
          }
          return createdNewsArticle ? mapSupabaseNewsToInternalNews(createdNewsArticle) : null;
        } catch (error) {
          console.error('Supabase mutation failed for creating news article:', error);
          if (error instanceof Error) throw error;
          throw new Error('Failed to create news article in Supabase');
        }
      }

      // Fallback to mock data logic
      console.log("Mock: Creating NewsArticle", data);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async
      const newMockId = String(Date.now() + Math.random()); // Add random to ensure more unique ID for mock
      const newArticle: NewsArticle = {
        id: newMockId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        title: data.title,
        slug: data.slug ?? null,
        excerpt: data.excerpt ?? null,
        content: data.content ?? '',
        author_id: data.author_id ?? null,
        author_name: 'Mock Author', // Placeholder for mock
        author_image: undefined, // Placeholder for mock
        publish_date: data.publish_date ?? new Date().toISOString(),
        hero_image: data.hero_image ?? null,
        hero_image_alt: data.hero_image_alt ?? data.title ?? null,
        tags: data.tags ?? null,
        status: data.status ?? 'draft',
        featured: data.featured ?? false,
      };
      // This mock creation doesn't persist to the global mockData.newsArticles array
      // For a more complete mock, you might push to mockData.newsArticles here
      return newArticle;
    },
    onSuccess: () => {
      // Invalidate queries for both Supabase and mock to ensure lists are refreshed
      queryClient.invalidateQueries({ queryKey: ['newsArticles', 'filtered'] }); // Broad invalidation for lists
      // More specific invalidations if needed:
      // queryClient.invalidateQueries({ queryKey: ['newsArticles', 'filtered', undefined, 'supabase'] });
      // queryClient.invalidateQueries({ queryKey: ['newsArticles', 'filtered', undefined, 'mock'] });
      
      // If a new article was created, its details might be cached, so invalidate that too.
      // However, create usually doesn't have an ID to invalidate for a specific item beforehand.
      // The list invalidation should cover it.
    }
  });
}

export function useUpdateNewsArticle(): UseMutationResult<NewsArticle | null, Error, { id: string; data: Partial<NewsArticleInput> }> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<NewsArticle | null, Error, { id: string; data: Partial<NewsArticleInput> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewsArticleInput> }): Promise<NewsArticle | null> => {
      if (useSupabase) {
        try {
          const supabaseUpdatePayload: Partial<SupabaseNewsArticleInsert> = {};
          // Construct payload with only the fields present in the partial data
          if (data.title !== undefined) supabaseUpdatePayload.title = data.title;
          if (data.slug !== undefined) supabaseUpdatePayload.slug = data.slug;
          if (data.excerpt !== undefined) supabaseUpdatePayload.excerpt = data.excerpt;
          if (data.content !== undefined) supabaseUpdatePayload.content = data.content;
          if (data.author_id !== undefined) supabaseUpdatePayload.author_id = data.author_id;
          if (data.publish_date !== undefined) supabaseUpdatePayload.publish_date = data.publish_date;
          if (data.hero_image !== undefined) supabaseUpdatePayload.hero_image = data.hero_image;
          if (data.hero_image_alt !== undefined) supabaseUpdatePayload.hero_image_alt = data.hero_image_alt;
          if (data.tags !== undefined) supabaseUpdatePayload.tags = data.tags;
          if (data.status !== undefined) supabaseUpdatePayload.status = data.status;
          if (data.featured !== undefined) supabaseUpdatePayload.featured = data.featured;
          supabaseUpdatePayload.updated_at = new Date().toISOString(); // Manually set updated_at for Supabase

          const { data: updatedNewsArticle, error } = await supabase
            .from('news')
            .update(supabaseUpdatePayload)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.error(`Error updating news article ${id} in Supabase:`, error);
            throw error;
          }
          return updatedNewsArticle ? mapSupabaseNewsToInternalNews(updatedNewsArticle) : null;
        } catch (error) {
          console.error(`Supabase mutation failed for updating news article ${id}:`, error);
          if (error instanceof Error) throw error;
          throw new Error('Failed to update news article in Supabase');
        }
      }
      
      // Fallback to mock data logic
      console.log(`Mock: Updating NewsArticle ${id}`, data);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async
      const articleIndex = mockData.newsArticles.findIndex(article => String(article.id) === id);
      if (articleIndex > -1) {
        const existingArticle = mapMockNewsToInternalNews(mockData.newsArticles[articleIndex]);
        const updatedArticleData: NewsArticle = {
          ...existingArticle,
          ...data, // Apply partial updates
          id: existingArticle.id, // Ensure ID is not changed by partial data
          updated_at: new Date().toISOString(),
          // Ensure publish_date is a string, as NewsArticle type requires it
          publish_date: typeof data.publish_date === 'string' 
                          ? data.publish_date 
                          : existingArticle.publish_date,
        };
        // To persist in mockData array (optional, depends on desired mock behavior):
        // mockData.newsArticles[articleIndex] = { 
        //   ...mockData.newsArticles[articleIndex], 
        //   ...updatedArticleData, // This needs careful merging with SupabaseNewsArticleInsert types if mockData stores raw supabase types
        //   updated_at: new Date().toISOString()
        // };
        return updatedArticleData;
      }
      console.warn(`Mock: NewsArticle with id ${id} not found for update.`);
      return null;
    },
    onSuccess: (_updatedData, variables) => { // Renamed updatedData to _updatedData to address lint warning
      queryClient.invalidateQueries({ queryKey: ['newsArticles', 'filtered'] }); // Broad list invalidation
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['newsArticle', variables.id, 'supabase'] });
        queryClient.invalidateQueries({ queryKey: ['newsArticle', variables.id, 'mock'] });
      }
    },
  });
}

export function useRelatedNewsArticles(articleId: string | undefined, tags: string[] | null | undefined, limit: number = 3): UseQueryResult<NewsArticle[], Error> {
  return useQuery<NewsArticle[], Error>({
    queryKey: ['newsArticles', 'related', articleId, tags, 'mock'],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (!articleId || !tags || tags.length === 0) return [];

      const mappedMockNews = mockData.newsArticles.map(mapMockNewsToInternalNews);

      const related = mappedMockNews.filter(article => {
        if (article.id === articleId) return false; // Exclude the current article
        if (!article.tags) return false; // Skip articles with no tags
        return article.tags.some(tag => tags.includes(tag)); // Check for common tags
      });

      return related.slice(0, limit);
    },
    enabled: !!articleId && !!tags && tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteNewsArticle(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string): Promise<boolean> => {
      if (useSupabase) {
        try {
          const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

          if (error) {
            console.error(`Error deleting news article ${id} from Supabase:`, error);
            throw error;
          }
          console.log(`Supabase: NewsArticle ${id} deleted successfully.`);
          return true;
        } catch (error) {
          console.error(`Supabase mutation failed for deleting news article ${id}:`, error);
          if (error instanceof Error) throw error;
          throw new Error('Failed to delete news article from Supabase');
        }
      }

      // Fallback to mock data logic
      console.log(`Mock: Deleting NewsArticle ${id}`);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate async
      const articleIndex = mockData.newsArticles.findIndex(article => String(article.id) === id);
      if (articleIndex > -1) {
        // mockData.newsArticles.splice(articleIndex, 1); // Optional: modify mock array
        console.log(`Mock: NewsArticle ${id} marked as deleted.`);
        return true;
      }
      console.warn(`Mock: NewsArticle with id ${id} not found for deletion.`);
      return false;
    },
    onSuccess: (success, id) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['newsArticles', 'filtered'] }); // Broad list invalidation
        queryClient.invalidateQueries({ queryKey: ['newsArticle', id, 'supabase'] });
        queryClient.invalidateQueries({ queryKey: ['newsArticle', id, 'mock'] });
      }
    },
  });
}
