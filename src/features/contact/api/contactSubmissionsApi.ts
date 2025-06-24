import { supabase } from '@/lib/supabase';

export interface ContactSubmissionData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submission_type?: string;
  source?: string;
  user_agent?: string;
  referrer_url?: string;
}

export interface ContactSubmissionFilter {
  status?: string;
  priority?: string;
  assigned_to?: string;
  submission_type?: string;
  date_range?: string;
  search_term?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submission_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed' | 'spam';
  assigned_to?: string;
  assigned_user?: any;
  assigned_at?: string;
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  response_count: number;
  response?: string;
  responded_at?: string;
  is_member: boolean;
  member_id?: string;
  source: string;
  user_agent?: string;
  ip_address?: string;
  referrer_url?: string;
  volunteer_type?: string;
  type?: string;
}

export interface ContactSubmissionNote {
  id: string;
  submission_id: string;
  note_text: string;
  note_type: 'internal' | 'status_change' | 'assignment' | 'follow_up' | 'resolution';
  is_internal: boolean;
  is_important: boolean;
  created_at: string;
  created_by: string;
}

export interface ContactSubmissionTag {
  id: string;
  submission_id: string;
  tag_name: string;
  tag_color: string;
  created_at: string;
}

export interface ContactSubmissionStats {
  total: number;
  by_status: Record<string, number>;
  unassigned_count: number;
  overdue_count: number;
}

class ContactSubmissionsAPI {
  /**
   * Submit a new contact form
   */
  async submitContactForm(data: ContactSubmissionData): Promise<ContactSubmission> {
    // Check if user is a member based on email
    const { data: member } = await supabase
      .from('members')
      .select('id, user_id')
      .eq('email', data.email)
      .single();

    const submissionData = {
      ...data,
      submission_type: data.submission_type || 'general',
      source: data.source || 'contact_form',
      is_member: !!member,
      member_id: member?.id,
      priority: 'medium' as const,
      status: 'open' as const,
      response_count: 0,
    };

    const { data: submission, error } = await (supabase as any)
      .from('contact_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;
    
    // Type assertion to handle interface mismatches
    return {
      ...submission,
      submission_type: submission.submission_type || 'general',
      response_count: submission.response_count || 0,
      is_member: submission.is_member || false,
      source: submission.source || 'contact_form'
    } as any as ContactSubmission;
  }

  /**
   * Get contact submissions with filtering and pagination
   */
  async getSubmissions(
    filters: ContactSubmissionFilter = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ submissions: ContactSubmission[]; total: number }> {
    let query = (supabase as any)
      .from('contact_submissions')
      .select(`
        *,
        assigned_user:assigned_to(email),
        member:member_id(name, image),
        contact_submission_tags(tag_name, tag_color),
        notes_count:contact_submission_notes(count)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    if (filters.assigned_to && filters.assigned_to !== 'all') {
      if (filters.assigned_to === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', filters.assigned_to);
      }
    }

    if (filters.submission_type && filters.submission_type !== 'all') {
      query = query.eq('submission_type', filters.submission_type);
    }

    // Search functionality
    if (filters.search_term) {
      query = query.or(`name.ilike.%${filters.search_term}%,email.ilike.%${filters.search_term}%,subject.ilike.%${filters.search_term}%`);
    }

    // Date range filter
    if (filters.date_range && filters.date_range !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.date_range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Transform data to ensure all required fields are present
    const transformedSubmissions = (data || []).map((submission: any) => ({
      ...submission,
      submission_type: submission.submission_type || 'general',
      response_count: submission.response_count || 0,
      is_member: submission.is_member || false,
      source: submission.source || 'contact_form'
    }));

    return {
      submissions: transformedSubmissions as any as ContactSubmission[],
      total: count || 0
    };
  }

  /**
   * Get a single contact submission by ID
   */
  async getSubmission(id: string): Promise<ContactSubmission> {
    const { data, error } = await (supabase as any)
      .from('contact_submissions')
      .select(`
        *,
        assigned_user:assigned_to(email),
        member:member_id(name, image)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Transform data to ensure all required fields are present
    return {
      ...data,
      submission_type: data.submission_type || 'general',
      response_count: data.response_count || 0,
      is_member: data.is_member || false,
      source: data.source || 'contact_form'
    } as any as ContactSubmission;
  }

  /**
   * Update a contact submission
   */
  async updateSubmission(id: string, updates: Partial<ContactSubmission>): Promise<void> {
    const { error } = await (supabase as any)
      .from('contact_submissions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Bulk update contact submissions
   */
  async bulkUpdateSubmissions(ids: string[], updates: Partial<ContactSubmission>): Promise<void> {
    const { error } = await (supabase as any)
      .from('contact_submissions')
      .update(updates)
      .in('id', ids);

    if (error) throw error;
  }

  /**
   * Delete a contact submission
   */
  async deleteSubmission(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get submission notes
   */
  async getSubmissionNotes(submissionId: string): Promise<ContactSubmissionNote[]> {
    const { data, error } = await (supabase as any)
      .from('contact_submission_notes')
      .select(`
        *,
        creator:created_by(email)
      `)
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((note: any) => ({ ...note } as any)) as ContactSubmissionNote[];
  }

  /**
   * Add a note to a submission
   */
  async addSubmissionNote(
    submissionId: string,
    noteText: string,
    noteType: ContactSubmissionNote['note_type'] = 'internal',
    isImportant: boolean = false
  ): Promise<ContactSubmissionNote> {
    const { data, error } = await (supabase as any)
      .from('contact_submission_notes')
      .insert({
        submission_id: submissionId,
        note_text: noteText,
        note_type: noteType,
        is_internal: true,
        is_important: isImportant,
        created_by: (window as any).user?.id || 'system' // Add default created_by
      } as any)
      .select()
      .single();

    if (error) throw error;
    return { 
      ...data,
      note_text: data?.note_text || noteText,
      note_type: data?.note_type || noteType,
      is_important: data?.is_important || isImportant,
      created_by: data?.created_by || 'system'
    } as any as ContactSubmissionNote;
  }

  /**
   * Delete a submission note
   */
  async deleteSubmissionNote(noteId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('contact_submission_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }

  /**
   * Get submission tags
   */
  async getSubmissionTags(submissionId: string): Promise<ContactSubmissionTag[]> {
    const { data, error } = await (supabase as any)
      .from('contact_submission_tags')
      .select('*')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((tag: any) => ({ ...tag } as any)) as ContactSubmissionTag[];
  }

  /**
   * Add a tag to a submission
   */
  async addSubmissionTag(
    submissionId: string,
    tagName: string,
    tagColor: string = '#6B7280'
  ): Promise<ContactSubmissionTag> {
    const { data, error } = await (supabase as any)
      .from('contact_submission_tags')
      .insert({
        submission_id: submissionId,
        tag_name: tagName,
        tag_color: tagColor
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data } as any as ContactSubmissionTag;
  }

  /**
   * Remove a tag from a submission
   */
  async removeSubmissionTag(tagId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('contact_submission_tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats(): Promise<{
    total: number;
    open: number;
    in_progress: number;
    closed: number;
    urgent: number;
    unassigned: number;
    response_needed: number;
  }> {
    const { data, error } = await (supabase as any)
      .from('contact_submissions')
      .select('status, priority, assigned_to, first_response_at');

    if (error) throw error;

    const submissions = data || [];
    
    return {
      total: submissions.length,
      open: submissions.filter((s: any) => s.status === 'open').length,
      in_progress: submissions.filter((s: any) => s.status === 'in_progress').length,
      closed: submissions.filter((s: any) => s.status === 'closed').length,
      urgent: submissions.filter((s: any) => s.priority === 'urgent').length,
      unassigned: submissions.filter((s: any) => !s.assigned_to).length,
      response_needed: submissions.filter((s: any) => !s.first_response_at && s.status !== 'closed').length
    };
  }

  /**
   * Get admin users for assignment
   */
  async getAdminUsers(): Promise<Array<{ id: string; email: string }>> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        users:user_id(email)
      `)
      .in('role', ['admin', 'superadmin']);

    if (error) throw error;
    
    return (data?.map(item => ({
      id: item.user_id,
      email: (item as any).users?.email
    })) || []) as any;
  }

  /**
   * Export submissions to CSV
   */
  async exportSubmissions(filters: ContactSubmissionFilter = {}): Promise<string> {
    const { submissions } = await this.getSubmissions(filters, 1, 1000); // Get up to 1000 records for export

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Subject',
      'Message',
      'Type',
      'Priority',
      'Status',
      'Assigned To',
      'Source',
      'Is Member',
      'Created At',
      'First Response At'
    ];

    const rows = submissions.map(submission => [
      submission.id,
      submission.name,
      submission.email,
      submission.phone || '',
      submission.subject,
      `"${submission.message.replace(/"/g, '""')}"`, // Escape quotes
      submission.submission_type,
      submission.priority,
      submission.status,
      submission.assigned_to || '',
      submission.source,
      submission.is_member ? 'Yes' : 'No',
      submission.created_at,
      submission.first_response_at || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

const contactSubmissionsAPI = new ContactSubmissionsAPI();

export { contactSubmissionsAPI };
export default contactSubmissionsAPI;