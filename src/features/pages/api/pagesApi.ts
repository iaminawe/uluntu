import { supabase } from '@/lib/supabase';
import { Page, CreatePageData, UpdatePageData, PageFilters } from '../types';

export interface PagesResponse {
  data: Page[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class PagesApi {
  private tableName = 'pages';

  async getPages(params?: {
    filters?: PageFilters;
    page?: number;
    limit?: number;
  }): Promise<PagesResponse> {
    const {
      filters = {},
      page = 1,
      limit = 12,
    } = params || {};

    let query = (supabase as any)
      .from(this.tableName)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'updated_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Page[],
      page,
      limit,
      total: count || 0,
      totalPages,
    };
  }

  async getPageById(id: string): Promise<Page> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Page;
  }

  async getPageBySlug(slug: string): Promise<Page> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Page;
  }

  async createPage(pageData: CreatePageData): Promise<Page> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newPage = {
      ...pageData,
      author_id: user.id,
      status: pageData.status || 'draft',
      is_featured: pageData.is_featured || false,
      published_at: pageData.status === 'published' ? new Date().toISOString() : null,
    };

    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .insert(newPage)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Page;
  }

  async updatePage(pageData: UpdatePageData): Promise<Page> {
    const { id, ...updates } = pageData;

    // If publishing, set published_at
    if (updates.status === 'published' && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Page;
  }

  async deletePage(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async publishPage(id: string): Promise<Page> {
    return this.updatePage({
      id,
      status: 'published',
      published_at: new Date().toISOString(),
    });
  }

  async unpublishPage(id: string): Promise<Page> {
    return this.updatePage({
      id,
      status: 'draft',
      published_at: undefined,
    });
  }

  async getHomePage(): Promise<Page | null> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id, name, title, company, location, image
        )
      `)
      .or('slug.eq.home,is_homepage.eq.true')
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No home page found
      }
      throw new Error(error.message);
    }

    return data as Page;
  }

  async getChildPages(parentId: string): Promise<Page[]> {
    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .select(`
        *,
        author:members!pages_author_id_fkey(
          id, name, title, company, location, image
        )
      `)
      .eq('parent_id', parentId)
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as Page[];
  }

  async generateSlug(title: string): Promise<string> {
    // Basic slug generation
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for existing slugs and append number if necessary
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await (supabase as any)
        .from(this.tableName)
        .select('id')
        .eq('slug', slug)
        .single();

      if (!data) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async uploadImage(file: File): Promise<{ url: string; path: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `pages/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  }

  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}

export const pagesApi = new PagesApi();