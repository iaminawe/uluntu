import { supabase } from '@/lib/supabase';

// Since contact_submissions table doesn't exist in our types yet,
// we'll use 'any' type casting until the database is updated
const contactDb = supabase as any;

// Helper function to adapt Supabase data to our types
function adaptSubmission(data: any): ContactSubmission {
  if (!data) return data;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    message: data.message,
    status: data.status,
    priority: data.priority || 'normal',
    subject: data.subject,
    referrer: data.referrer,
    tags: data.tags,
    assigned_to: data.assigned_to,
    assigned_by: data.assigned_by,
    resolved_at: data.resolved_at,
    ip_address: data.ip_address,
    user_agent: data.user_agent,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assigned_to?: string;
  assigned_by?: string;
  resolved_at?: string;
  referrer?: string;
  tags?: string[];
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmissionNote {
  id: string;
  submission_id: string;
  user_id: string;
  note: string;
  is_internal: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

export interface ContactSubmissionAttachment {
  id: string;
  submission_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_at: string;
}

export interface ContactSubmissionStats {
  total_submissions: number;
  unread_submissions: number;
  read_submissions: number;
  responded_submissions: number;
  archived_submissions: number;
  submissions_this_week: number;
  submissions_this_month: number;
  volunteer_type_breakdown: Record<string, number>;
}

export interface CreateContactSubmissionRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  volunteer_type?: 'attend' | 'present' | 'organize' | 'sponsor';
  source?: string;
}

export interface UpdateContactSubmissionRequest {
  status?: 'unread' | 'read' | 'responded' | 'archived';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: string;
  response?: string;
}

export interface CreateNoteRequest {
  submission_id: string;
  note: string;
  is_internal?: boolean;
}

/**
 * Contact Submissions API for managing contact form submissions
 */
export class ContactSubmissionsAPI {
  
  /**
   * Submit a new contact form (public endpoint)
   */
  async submitContactForm(data: CreateContactSubmissionRequest): Promise<ContactSubmission> {
    try {
      const { data: submission, error } = await (supabase as any)
        .from('contact_submissions')
        .insert({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          volunteer_type: data.volunteer_type,
          source: data.source || 'contact_page',
          ip_address: undefined, // Could be populated from request context
          user_agent: navigator.userAgent || undefined,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification email if configured
      await this.sendNewSubmissionNotification(adaptSubmission(submission));

      return adaptSubmission(submission);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }

  /**
   * Get all contact submissions (admin only)
   */
  async getAllSubmissions(
    page = 1,
    pageSize = 20,
    status?: string,
    priority?: string,
    volunteer_type?: string
  ): Promise<{ data: ContactSubmission[]; count: number }> {
    try {
      let query = (supabase as any)
        .from('contact_submissions')
        .select('*, assigned_user:assigned_to(id, full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (priority) {
        query = query.eq('priority', priority);
      }
      if (volunteer_type) {
        query = query.eq('volunteer_type', volunteer_type);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: (data || []).map(adaptSubmission), count: count || 0 };
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      throw error;
    }
  }

  /**
   * Get a single contact submission with notes (admin only)
   */
  async getSubmissionById(id: string): Promise<ContactSubmission & { notes: ContactSubmissionNote[] }> {
    try {
      const { data: submission, error: submissionError } = await (supabase as any)
        .from('contact_submissions')
        .select('*, assigned_user:assigned_to(id, full_name, email)')
        .eq('id', id)
        .single();

      if (submissionError) throw submissionError;

      const { data: notes, error: notesError } = await contactDb
        .from('contact_submission_notes')
        .select('*, user:user_id(id, full_name, email)')
        .eq('submission_id', id)
        .order('created_at', { ascending: true });

      if (notesError) throw notesError;

      return { ...submission, notes: notes || [] };
    } catch (error) {
      console.error('Error fetching contact submission:', error);
      throw error;
    }
  }

  /**
   * Update a contact submission (admin only)
   */
  async updateSubmission(id: string, updates: UpdateContactSubmissionRequest): Promise<ContactSubmission> {
    try {
      const updateData: any = { ...updates };
      
      if (updates.status === 'responded' && updates.response) {
        updateData.responded_at = new Date().toISOString();
      }

      const { data, error } = await contactDb
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating contact submission:', error);
      throw error;
    }
  }

  /**
   * Mark submission as read (admin only)
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await contactDb.rpc('mark_submission_as_read', { 
        submission_id: id 
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking submission as read:', error);
      return false;
    }
  }

  /**
   * Assign submission to user (admin only)
   */
  async assignToUser(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await contactDb.rpc('assign_submission', { 
        submission_id: id,
        assignee_id: userId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning submission:', error);
      return false;
    }
  }

  /**
   * Add a note to a submission (admin only)
   */
  async addNote(data: CreateNoteRequest): Promise<ContactSubmissionNote> {
    try {
      const { data: note, error } = await contactDb
        .from('contact_submission_notes')
        .insert({
          submission_id: data.submission_id,
          user_id: (await contactDb.auth.getUser()).data.user?.id,
          note: data.note,
          is_internal: data.is_internal ?? true,
        })
        .select('*, user:user_id(id, full_name, email)')
        .single();

      if (error) throw error;

      return note;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  /**
   * Delete a contact submission (superadmin only)
   */
  async deleteSubmission(id: string): Promise<boolean> {
    try {
      const { error } = await contactDb
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting contact submission:', error);
      return false;
    }
  }

  /**
   * Get contact submission statistics (admin only)
   */
  async getStats(): Promise<ContactSubmissionStats> {
    try {
      const { data, error } = await (supabase as any).rpc('get_contact_submission_stats');

      if (error) throw error;

      return data as ContactSubmissionStats;
    } catch (error) {
      console.error('Error fetching contact submission stats:', error);
      throw error;
    }
  }

  /**
   * Search contact submissions (admin only)
   */
  async searchSubmissions(
    query: string,
    page = 1,
    pageSize = 20
  ): Promise<{ data: ContactSubmission[]; count: number }> {
    try {
      const searchQuery = `%${query}%`;
      let dbQuery = supabase
        .from('contact_submissions')
        .select('*, assigned_user:assigned_to(id, full_name, email)', { count: 'exact' })
        .or(`name.ilike.${searchQuery},email.ilike.${searchQuery},subject.ilike.${searchQuery},message.ilike.${searchQuery}`)
        .order('created_at', { ascending: false });

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      dbQuery = dbQuery.range(from, to);

      const { data, error, count } = await dbQuery;

      if (error) throw error;

      return { data: (data || []).map(adaptSubmission), count: count || 0 };
    } catch (error) {
      console.error('Error searching contact submissions:', error);
      throw error;
    }
  }

  /**
   * Get unread submissions count (admin only)
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await contactDb
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Send email notification for new submission (private method)
   */
  private async sendNewSubmissionNotification(submission: ContactSubmission): Promise<void> {
    try {
      // This would integrate with your email service (like Resend)
      // For now, we'll just log that a notification should be sent
      console.log('New contact submission notification should be sent:', {
        submission_id: submission.id,
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        volunteer_type: (submission as any).volunteer_type,
      });

      // TODO: Implement actual email sending logic
      // You could use the existing resend service in src/services/resend.ts
    } catch (error) {
      console.error('Error sending new submission notification:', error);
      // Don't throw here - notification failure shouldn't fail the submission
    }
  }

  /**
   * Export submissions to CSV (admin only)
   */
  async exportSubmissions(
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<string> {
    try {
      let query = (supabase as any)
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to CSV
      if (!data || data.length === 0) {
        return '';
      }

      const headers = [
        'ID', 'Name', 'Email', 'Subject', 'Message', 'Volunteer Type',
        'Status', 'Priority', 'Source', 'Created At', 'Updated At'
      ];

      const csvRows = [
        headers.join(','),
        ...data.map((row: any) => [
          row.id,
          `"${row.name}"`,
          row.email,
          `"${row.subject || ''}"`,
          `"${row.message.replace(/"/g, '""')}"`,
          row.volunteer_type || '',
          row.status,
          row.priority || 'normal',
          row.source || 'contact_page',
          row.created_at || row.submitted_at,
          row.updated_at || row.submitted_at
        ].join(','))
      ];

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting submissions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contactSubmissionsApi = new ContactSubmissionsAPI();