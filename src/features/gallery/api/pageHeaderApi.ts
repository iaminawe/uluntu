import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import {
  PageHeaderAssignment,
  PageHeaderAssignmentsResponse,
  CreatePageHeaderAssignmentData
} from '../types';

class PageHeaderAssignmentApi {
  private tableName = 'page_header_assignments';

  async getAssignments(params?: {
    page?: number;
    limit?: number;
    pagePath?: string;
    isActive?: boolean;
    photoId?: string;
  }): Promise<PageHeaderAssignmentsResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        pagePath,
        isActive,
        photoId,
      } = params || {};

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!page_header_assignments_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description,
            gallery:galleries!photos_gallery_id_fkey(
              id,
              title,
              slug
            ),
            uploader:members!photos_uploaded_by_fkey(
              id,
              name,
              image
            )
          ),
          creator:members!page_header_assignments_created_by_fkey(
            id,
            name,
            image
          )
        `, { count: 'exact' });

      // Apply filters
      if (pagePath) {
        query = query.eq('page_path', pagePath);
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
        
        // If looking for active assignments, also check date range
        if (isActive) {
          const now = new Date().toISOString();
          query = query.or(`start_date.is.null,start_date.lte.${now}`)
                       .or(`end_date.is.null,end_date.gte.${now}`);
        }
      }

      if (photoId) {
        query = query.eq('photo_id', photoId);
      }

      // Apply sorting (by priority desc, then created date desc)
      query = query.order('priority', { ascending: false })
                   .order('created_at', { ascending: false });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw handleSupabaseError(error);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data as PageHeaderAssignment[],
        page,
        limit,
        total: count || 0,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching page header assignments:', error);
      throw error;
    }
  }

  async getAssignmentById(id: string): Promise<PageHeaderAssignment> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!page_header_assignments_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description,
            gallery:galleries!photos_gallery_id_fkey(
              id,
              title,
              slug
            ),
            uploader:members!photos_uploaded_by_fkey(
              id,
              name,
              image
            )
          ),
          creator:members!page_header_assignments_created_by_fkey(
            id,
            name,
            image
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PageHeaderAssignment;
    } catch (error) {
      console.error('Error fetching page header assignment by ID:', error);
      throw error;
    }
  }

  async getActiveAssignmentForPage(pagePath: string): Promise<PageHeaderAssignment | null> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!page_header_assignments_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description,
            gallery:galleries!photos_gallery_id_fkey(
              id,
              title,
              slug
            )
          )
        `)
        .eq('page_path', pagePath)
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No active assignment found
        }
        throw handleSupabaseError(error);
      }

      return data as PageHeaderAssignment;
    } catch (error) {
      console.error('Error fetching active page header assignment:', error);
      return null;
    }
  }

  async createAssignment(assignmentData: CreatePageHeaderAssignmentData): Promise<PageHeaderAssignment> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if there's already an active assignment for this page with higher priority
      const existingAssignment = await this.getActiveAssignmentForPage(assignmentData.pagePath);
      
      let priority = assignmentData.priority || 1;
      if (existingAssignment && existingAssignment.priority >= priority) {
        priority = existingAssignment.priority + 1;
      }

      const newAssignment = {
        photo_id: assignmentData.photoId,
        page_path: assignmentData.pagePath,
        page_title: assignmentData.pageTitle,
        start_date: assignmentData.startDate,
        end_date: assignmentData.endDate,
        priority,
        is_active: true,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(newAssignment)
        .select(`
          *,
          photo:photos!page_header_assignments_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description
          ),
          creator:members!page_header_assignments_created_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PageHeaderAssignment;
    } catch (error) {
      console.error('Error creating page header assignment:', error);
      throw error;
    }
  }

  async updateAssignment(
    id: string,
    updates: Partial<CreatePageHeaderAssignmentData> & {
      isActive?: boolean;
      priority?: number;
    }
  ): Promise<PageHeaderAssignment> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          photo:photos!page_header_assignments_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description
          ),
          creator:members!page_header_assignments_created_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PageHeaderAssignment;
    } catch (error) {
      console.error('Error updating page header assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      console.error('Error deleting page header assignment:', error);
      throw error;
    }
  }

  async activateAssignment(id: string): Promise<PageHeaderAssignment> {
    return this.updateAssignment(id, { isActive: true });
  }

  async deactivateAssignment(id: string): Promise<PageHeaderAssignment> {
    return this.updateAssignment(id, { isActive: false });
  }

  async scheduleAssignment(
    id: string,
    startDate: string,
    endDate?: string
  ): Promise<PageHeaderAssignment> {
    return this.updateAssignment(id, {
      startDate,
      endDate,
      isActive: true,
    });
  }

  async getScheduledAssignments(
    startDate?: string,
    endDate?: string
  ): Promise<PageHeaderAssignment[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          photo:photos!page_header_assignments_photo_id_fkey(
            id,
            title,
            url,
            thumbnail_url,
            description
          ),
          creator:members!page_header_assignments_created_by_fkey(
            id,
            name,
            image
          )
        `)
        .not('start_date', 'is', null);

      if (startDate) {
        query = query.gte('start_date', startDate);
      }

      if (endDate) {
        query = query.lte('start_date', endDate);
      }

      query = query.order('start_date', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PageHeaderAssignment[];
    } catch (error) {
      console.error('Error fetching scheduled assignments:', error);
      throw error;
    }
  }

  async updatePriorities(assignments: Array<{ id: string; priority: number }>): Promise<boolean> {
    try {
      const updates = assignments.map(({ id, priority }) =>
        supabase
          .from(this.tableName)
          .update({ priority })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        console.error('Some priority updates failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating assignment priorities:', error);
      return false;
    }
  }

  async getPageList(): Promise<Array<{ path: string; title: string; activeAssignments: number }>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('page_path, page_title, is_active')
        .order('page_path');

      if (error) {
        throw handleSupabaseError(error);
      }

      // Group by page path and count active assignments
      const pageMap = new Map<string, { title: string; activeCount: number }>();
      
      data.forEach(assignment => {
        const existing = pageMap.get(assignment.page_path);
        if (existing) {
          if (assignment.is_active) {
            existing.activeCount++;
          }
        } else {
          pageMap.set(assignment.page_path, {
            title: assignment.page_title,
            activeCount: assignment.is_active ? 1 : 0,
          });
        }
      });

      return Array.from(pageMap.entries()).map(([path, info]) => ({
        path,
        title: info.title,
        activeAssignments: info.activeCount,
      }));
    } catch (error) {
      console.error('Error fetching page list:', error);
      throw error;
    }
  }

  async deactivateExpiredAssignments(): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
        })
        .eq('is_active', true)
        .not('end_date', 'is', null)
        .lt('end_date', now)
        .select('id');

      if (error) {
        throw handleSupabaseError(error);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error deactivating expired assignments:', error);
      return 0;
    }
  }

  async activateScheduledAssignments(): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: true,
        })
        .eq('is_active', false)
        .not('start_date', 'is', null)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .select('id');

      if (error) {
        throw handleSupabaseError(error);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error activating scheduled assignments:', error);
      return 0;
    }
  }
}

export const pageHeaderAssignmentApi = new PageHeaderAssignmentApi();