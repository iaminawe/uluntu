import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactSubmissionsAPI as contactSubmissionsApi, ContactSubmissionFilter, ContactSubmission } from '@/features/contact/api/contactSubmissionsApi';
import { logAndSanitizeError } from '@/utils/errorSanitization';

export interface UseContactSubmissionsOptions {
  filters?: ContactSubmissionFilter;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseContactSubmissionsReturn {
  submissions: ContactSubmission[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
  createSubmission: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateSubmission: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  deleteSubmission: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function useContactSubmissions(options: UseContactSubmissionsOptions = {}): UseContactSubmissionsReturn {
  const queryClient = useQueryClient();
  const {
    filters = {},
    page = 1,
    limit = 25,
    autoFetch = true
  } = options;

  // Fetch submissions query
  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['contact-submissions', filters, page, limit],
    queryFn: () => contactSubmissionsApi.getSubmissions(filters, page, limit),
    enabled: autoFetch,
    placeholderData: (previousData) => previousData
  });

  // Create submission mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => contactSubmissionsApi.submitContactForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    }
  });

  // Update submission mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      contactSubmissionsApi.updateSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    }
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactSubmissionsApi.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    }
  });

  const createSubmission = async (data: any) => {
    try {
      const result = await createMutation.mutateAsync(data);
      return result;
    } catch (err) {
      const sanitized = logAndSanitizeError(err, 'Contact Submissions - Create');
      return {
        success: false,
        error: sanitized.userMessage
      };
    }
  };

  const updateSubmission = async (id: string, data: any) => {
    try {
      const result = await updateMutation.mutateAsync({ id, data });
      return result;
    } catch (err) {
      const sanitized = logAndSanitizeError(err, 'Contact Submissions - Update');
      return {
        success: false,
        error: sanitized.userMessage
      };
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const result = await deleteMutation.mutateAsync(id);
      return result;
    } catch (err) {
      const sanitized = logAndSanitizeError(err, 'Contact Submissions - Delete');
      return {
        success: false,
        error: sanitized.userMessage
      };
    }
  };

  return {
    submissions: data?.submissions || [],
    loading,
    error: queryError ? logAndSanitizeError(queryError, 'Contact Submissions - Fetch').userMessage : null,
    total: data?.total || 0,
    totalPages: (data as any)?.totalPages || 0,
    currentPage: page,
    refetch: () => refetch().then(() => void 0),
    createSubmission: createSubmission as (data: any) => Promise<{ success: boolean; error?: string | undefined; }>,
    updateSubmission: updateSubmission as (id: string, data: any) => Promise<{ success: boolean; error?: string | undefined; }>,
    deleteSubmission: deleteSubmission as (id: string) => Promise<{ success: boolean; error?: string | undefined; }>,
  };
}

export interface ContactSubmissionStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  urgent: number;
  unassigned: number;
  response_needed: number;
}

export interface UseContactSubmissionStatsReturn {
  stats: ContactSubmissionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContactSubmissionStats(dateRange?: { start: string; end: string }): UseContactSubmissionStatsReturn {
  const { 
    data: stats, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['contact-submission-stats', dateRange],
    queryFn: () => contactSubmissionsApi.getSubmissionStats()
  });

  return {
    stats: stats || null,
    loading,
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch stats') : null,
    refetch: () => refetch().then(() => void 0),
  };
}

export interface UseContactSubmissionReturn {
  submission: ContactSubmission | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (data: any) => Promise<{ success: boolean; error?: string }>;
  delete: () => Promise<{ success: boolean; error?: string }>;
}

export function useContactSubmission(id: string): UseContactSubmissionReturn {
  const queryClient = useQueryClient();
  
  const { 
    data: submission, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['contact-submission', id],
    queryFn: () => contactSubmissionsApi.getSubmission(id),
    enabled: !!id
  });

  // Update submission mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => contactSubmissionsApi.updateSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submission', id] });
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    }
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: () => contactSubmissionsApi.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    }
  });

  const updateSubmission = async (data: any) => {
    try {
      const result = await updateMutation.mutateAsync(data);
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update submission'
      };
    }
  };

  const deleteSubmission = async () => {
    try {
      const result = await deleteMutation.mutateAsync();
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete submission'
      };
    }
  };

  return {
    submission: submission || null,
    loading,
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch submission') : null,
    refetch: () => refetch().then(() => void 0),
    update: updateSubmission as (data: any) => Promise<{ success: boolean; error?: string | undefined; }>,
    delete: deleteSubmission as () => Promise<{ success: boolean; error?: string | undefined; }>,
  };
}

// Hook for managing notification preferences
export interface UseNotificationPreferencesReturn {
  preferences: any | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (preferences: any) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const queryClient = useQueryClient();
  
  const { 
    data: preferences, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      // This would integrate with your user preferences API
      // For now, return default preferences
      return {
        email_notifications: true,
        notification_types: {
          new_submission: true,
          status_change: true,
          assignment: true,
          mentions: true,
        },
        digest_frequency: 'immediate',
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00',
          timezone: 'America/Vancouver',
        },
      };
    }
  });

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      // This would save to your backend
      return { success: true, data: newPreferences };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      }
    }
  });

  const updatePreferences = async (newPreferences: any) => {
    try {
      const result = await updateMutation.mutateAsync(newPreferences);
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update preferences'
      };
    }
  };

  return {
    preferences: preferences || null,
    loading,
    error: queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch preferences') : null,
    updatePreferences,
    refetch: () => refetch().then(() => void 0),
  };
}