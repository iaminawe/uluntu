import { supabase } from '@/lib/supabase';
import { emailNotificationService, ContactSubmission } from '@/services/emailNotificationService';

export interface CreateContactSubmissionRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  type?: 'general' | 'support' | 'partnership' | 'volunteer' | 'speaker_request';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface UpdateContactSubmissionRequest {
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface ContactSubmissionFilters {
  status?: string[];
  type?: string[];
  priority?: string[];
  assigned_to?: string;
  created_after?: string;
  created_before?: string;
  search?: string;
}

export interface ContactSubmissionStats {
  total: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  avg_response_time_hours: number;
  unassigned_count: number;
  overdue_count: number;
}

export class ContactSubmissionsAPI {
  /**
   * Create a new contact submission
   */
  async createSubmission(
    request: CreateContactSubmissionRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; data?: ContactSubmission; error?: string }> {
    try {
      // Validate input
      if (!request.name || !request.email || !request.subject || !request.message) {
        return {
          success: false,
          error: 'Missing required fields: name, email, subject, and message are required'
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(request.email)) {
        return {
          success: false,
          error: 'Invalid email address format'
        };
      }

      // Rate limiting check (prevent spam)
      const recentSubmissions = await this.getRecentSubmissionsByEmail(request.email, 24);
      if (recentSubmissions.length >= 5) {
        return {
          success: false,
          error: 'Too many submissions in the last 24 hours. Please try again later.'
        };
      }

      // Auto-detect priority based on keywords
      const autoPriority = this.detectPriority(request.subject, request.message);
      
      // Create submission
      const submissionData = {
        name: request.name.trim(),
        email: request.email.toLowerCase().trim(),
        subject: request.subject.trim(),
        message: request.message.trim(),
        type: request.type || 'general',
        status: 'new',
        priority: request.priority || autoPriority,
        tags: this.extractTags(request.subject, request.message),
        metadata: {
          ...request.metadata,
          auto_detected_priority: autoPriority,
          ip_address: ipAddress,
          user_agent: userAgent,
          spam_score: this.calculateSpamScore(request),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into database
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) throw error;

      const submission = data as ContactSubmission;

      // Send notification emails
      try {
        await emailNotificationService.sendNewSubmissionNotification(submission);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the submission if email fails
      }

      // Log analytics
      await this.recordAnalytics('submission_created', {
        submission_id: submission.id,
        type: submission.type,
        priority: submission.priority,
        has_metadata: !!request.metadata,
      });

      return {
        success: true,
        data: submission
      };

    } catch (error) {
      console.error('Error creating contact submission:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create submission'
      };
    }
  }

  /**
   * Get contact submissions with filters and pagination
   */
  async getSubmissions(
    filters: ContactSubmissionFilters = {},
    page: number = 1,
    limit: number = 25
  ): Promise<{
    submissions: ContactSubmission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters.type?.length) {
        query = query.in('type', filters.type);
      }

      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,` +
          `email.ilike.%${filters.search}%,` +
          `subject.ilike.%${filters.search}%,` +
          `message.ilike.%${filters.search}%`
        );
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        submissions: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return {
        submissions: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }

  /**
   * Get a single contact submission by ID
   */
  async getSubmissionById(id: string): Promise<ContactSubmission | null> {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as ContactSubmission;

    } catch (error) {
      console.error('Error fetching contact submission:', error);
      return null;
    }
  }

  /**
   * Update a contact submission
   */
  async updateSubmission(
    id: string,
    request: UpdateContactSubmissionRequest,
    updatedBy?: string
  ): Promise<{ success: boolean; data?: ContactSubmission; error?: string }> {
    try {
      // Get current submission for status change detection
      const currentSubmission = await this.getSubmissionById(id);
      if (!currentSubmission) {
        return {
          success: false,
          error: 'Submission not found'
        };
      }

      const updateData = {
        ...request,
        updated_at: new Date().toISOString(),
      };

      // Update in database
      const { data, error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedSubmission = data as ContactSubmission;

      // Send notifications for status changes
      if (request.status && request.status !== currentSubmission.status) {
        try {
          await emailNotificationService.sendStatusChangeNotification(
            updatedSubmission,
            currentSubmission.status,
            request.status,
            updatedBy || 'System'
          );
        } catch (emailError) {
          console.error('Failed to send status change notification:', emailError);
        }
      }

      // Send notifications for assignments
      if (request.assigned_to && request.assigned_to !== currentSubmission.assigned_to) {
        try {
          await emailNotificationService.sendAssignmentNotification(
            updatedSubmission,
            request.assigned_to,
            updatedBy || 'System'
          );
        } catch (emailError) {
          console.error('Failed to send assignment notification:', emailError);
        }
      }

      // Log analytics
      await this.recordAnalytics('submission_updated', {
        submission_id: id,
        changes: Object.keys(request),
        status_changed: request.status !== currentSubmission.status,
        assigned: !!request.assigned_to,
      });

      return {
        success: true,
        data: updatedSubmission
      };

    } catch (error) {
      console.error('Error updating contact submission:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update submission'
      };
    }
  }

  /**
   * Delete a contact submission
   */
  async deleteSubmission(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log analytics
      await this.recordAnalytics('submission_deleted', {
        submission_id: id,
      });

      return { success: true };

    } catch (error) {
      console.error('Error deleting contact submission:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete submission'
      };
    }
  }

  /**
   * Get contact submission statistics
   */
  async getStats(dateRange?: { start: string; end: string }): Promise<ContactSubmissionStats> {
    try {
      let query = supabase
        .from('contact_submissions')
        .select('*');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const submissions = data || [];

      // Calculate statistics
      const stats: ContactSubmissionStats = {
        total: submissions.length,
        by_status: {},
        by_type: {},
        by_priority: {},
        avg_response_time_hours: 0,
        unassigned_count: 0,
        overdue_count: 0,
      };

      // Group by status, type, and priority
      submissions.forEach(submission => {
        stats.by_status[submission.status] = (stats.by_status[submission.status] || 0) + 1;
        stats.by_type[submission.type] = (stats.by_type[submission.type] || 0) + 1;
        stats.by_priority[submission.priority] = (stats.by_priority[submission.priority] || 0) + 1;

        if (!submission.assigned_to) {
          stats.unassigned_count++;
        }

        // Check if overdue (more than 48 hours old and not resolved/closed)
        const hoursOld = (new Date().getTime() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursOld > 48 && !['resolved', 'closed'].includes(submission.status)) {
          stats.overdue_count++;
        }
      });

      // Calculate average response time for resolved/closed submissions
      const resolvedSubmissions = submissions.filter(s => ['resolved', 'closed'].includes(s.status));
      if (resolvedSubmissions.length > 0) {
        const totalResponseTime = resolvedSubmissions.reduce((sum, submission) => {
          const responseTime = (new Date(submission.updated_at).getTime() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60);
          return sum + responseTime;
        }, 0);
        stats.avg_response_time_hours = totalResponseTime / resolvedSubmissions.length;
      }

      return stats;

    } catch (error) {
      console.error('Error fetching contact submission stats:', error);
      return {
        total: 0,
        by_status: {},
        by_type: {},
        by_priority: {},
        avg_response_time_hours: 0,
        unassigned_count: 0,
        overdue_count: 0,
      };
    }
  }

  /**
   * Get recent submissions by email (for rate limiting)
   */
  private async getRecentSubmissionsByEmail(email: string, hours: number): Promise<ContactSubmission[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('email', email.toLowerCase())
        .gte('created_at', cutoffTime);

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error fetching recent submissions:', error);
      return [];
    }
  }

  /**
   * Auto-detect priority based on content
   */
  private detectPriority(subject: string, message: string): 'low' | 'medium' | 'high' | 'urgent' {
    const content = `${subject} ${message}`.toLowerCase();

    // Urgent keywords
    const urgentKeywords = [
      'urgent', 'emergency', 'asap', 'immediately', 'critical', 'broken', 'down', 'not working',
      'security', 'hack', 'breach', 'compromised', 'virus', 'malware'
    ];

    // High priority keywords
    const highKeywords = [
      'important', 'problem', 'issue', 'error', 'bug', 'unable to', 'cannot', 'failing',
      'deadline', 'time sensitive', 'payment', 'billing'
    ];

    // Medium priority keywords
    const mediumKeywords = [
      'question', 'help', 'support', 'how to', 'guidance', 'clarification', 'feature request'
    ];

    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'urgent';
    }

    if (highKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }

    if (mediumKeywords.some(keyword => content.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Extract tags from content
   */
  private extractTags(subject: string, message: string): string[] {
    const content = `${subject} ${message}`.toLowerCase();
    const tags: string[] = [];

    // Define tag patterns
    const tagPatterns = {
      'technical': ['technical', 'code', 'programming', 'development', 'software', 'api', 'database'],
      'event': ['event', 'meetup', 'workshop', 'conference', 'speaking', 'presentation'],
      'partnership': ['partnership', 'collaboration', 'sponsor', 'business', 'corporate'],
      'membership': ['member', 'join', 'registration', 'account', 'profile'],
      'volunteer': ['volunteer', 'help', 'contribute', 'organize'],
      'feedback': ['feedback', 'suggestion', 'improvement', 'complaint'],
      'billing': ['billing', 'payment', 'invoice', 'subscription', 'fee'],
      'urgent': ['urgent', 'emergency', 'critical', 'asap'],
    };

    Object.entries(tagPatterns).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  }

  /**
   * Calculate spam score
   */
  private calculateSpamScore(request: CreateContactSubmissionRequest): number {
    let score = 0;

    // Check for spam indicators
    const content = `${request.subject} ${request.message}`.toLowerCase();

    // Excessive capitalization
    const uppercaseRatio = (request.subject.match(/[A-Z]/g) || []).length / request.subject.length;
    if (uppercaseRatio > 0.5) score += 2;

    // Repeated exclamation marks
    if (content.match(/!{3,}/)) score += 2;

    // Common spam words
    const spamWords = ['free', 'win', 'winner', 'congratulations', 'million', 'lottery', 'click here', 'buy now'];
    spamWords.forEach(word => {
      if (content.includes(word)) score += 1;
    });

    // Very short or very long messages
    if (request.message.length < 10) score += 1;
    if (request.message.length > 5000) score += 1;

    // URLs in message
    const urlMatches = request.message.match(/https?:\/\/[^\s]+/g);
    if (urlMatches && urlMatches.length > 3) score += 2;

    return Math.min(score, 10); // Cap at 10
  }

  /**
   * Record analytics event
   */
  private async recordAnalytics(event: string, data: Record<string, any>): Promise<void> {
    try {
      // This would integrate with your analytics system
      console.log(`Analytics: ${event}`, data);
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }

  /**
   * Export submissions to CSV
   */
  async exportSubmissions(filters: ContactSubmissionFilters = {}): Promise<string> {
    try {
      const { submissions } = await this.getSubmissions(filters, 1, 10000); // Get all matching submissions

      const headers = [
        'ID', 'Name', 'Email', 'Subject', 'Type', 'Status', 'Priority',
        'Assigned To', 'Tags', 'Created At', 'Updated At'
      ];

      const csvRows = submissions.map(submission => [
        submission.id,
        submission.name,
        submission.email,
        submission.subject,
        submission.type,
        submission.status,
        submission.priority,
        submission.assigned_to || '',
        (submission.tags || []).join('; '),
        submission.created_at,
        submission.updated_at
      ]);

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return csvContent;

    } catch (error) {
      console.error('Error exporting submissions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contactSubmissionsApi = new ContactSubmissionsAPI();