import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Inbox, 
  Mail, 
  MailOpen, 
  Search, 
  Filter, 
  Download,
  User,
  Clock,
  MessageSquare,
  Archive,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import contactSubmissionsAPI from '@/features/contact/api/contactSubmissionsApi';
import type { ContactSubmission } from '@/features/contact/api/contactSubmissionsApi';

interface ContactInboxPageProps {}

type FilterStatus = 'all' | 'new' | 'in_progress' | 'resolved' | 'closed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';
type FilterVolunteerType = 'all' | 'attend' | 'present' | 'organize' | 'sponsor';

const ContactInboxPage: React.FC<ContactInboxPageProps> = () => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterVolunteerType, setFilterVolunteerType] = useState<FilterVolunteerType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 20;

  // Build filters for the query
  const filters = useMemo(() => {
    const statusFilter = filterStatus === 'all' ? undefined : filterStatus;
    const priorityFilter = filterPriority === 'all' ? undefined : filterPriority;
    const volunteerTypeFilter = filterVolunteerType === 'all' ? undefined : filterVolunteerType;

    const apiFilters: any = {};
    if (statusFilter) apiFilters.status = [statusFilter];
    if (priorityFilter) apiFilters.priority = [priorityFilter];
    if (volunteerTypeFilter) apiFilters.type = [volunteerTypeFilter];
    if (searchQuery.trim()) apiFilters.search = searchQuery;

    return apiFilters;
  }, [filterStatus, filterPriority, filterVolunteerType, searchQuery]);

  // Fetch submissions using React Query
  const { data: submissionsData, isLoading: loading } = useQuery({
    queryKey: ['contact-submissions', filters, currentPage, pageSize],
    queryFn: () => contactSubmissionsAPI.getSubmissions(filters, currentPage, pageSize),
    placeholderData: (previousData) => previousData
  });

  const submissions = submissionsData?.submissions || [];
  const totalCount = submissionsData?.total || 0;

  // Fetch stats using React Query
  const { data: stats = {} } = useQuery({
    queryKey: ['contact-submission-stats'],
    queryFn: () => (contactSubmissionsAPI as any).getStats()
  });

  // Update submission mutation
  const updateSubmissionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ContactSubmission> }) => 
      contactSubmissionsAPI.updateSubmission(id, updates),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['contact-submission-stats'] });
    }
  });

  const handleSubmissionClick = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    
    if (submission.status === 'open') {
      try {
        await updateSubmissionMutation.mutateAsync({
          id: submission.id,
          updates: { status: 'in_progress' }
        });
        // Update the selected submission
        setSelectedSubmission({ ...submission, status: 'in_progress' });
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const result = await updateSubmissionMutation.mutateAsync({
        id,
        updates: { status: status as any }
      });
      if ((result as any).success && selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: status as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityUpdate = async (id: string, priority: string) => {
    try {
      const result = await updateSubmissionMutation.mutateAsync({
        id,
        updates: { priority: priority as any }
      });
      if ((result as any).success && selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, priority: priority as any });
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const exportSubmissions = async () => {
    try {
      const csv = await contactSubmissionsAPI.exportSubmissions({});
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting submissions:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'in_progress': return <MailOpen className="h-4 w-4 text-orange-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <Archive className="h-4 w-4 text-gray-400" />;
      default: return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVolunteerTypeLabel = (type: string | undefined) => {
    if (!type) return 'General';
    switch (type) {
      case 'attend': return 'Attend Events';
      case 'present': return 'Present/Speak';
      case 'organize': return 'Help Organize';
      case 'sponsor': return 'Sponsor Events';
      default: return type;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar - Submissions List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Inbox className="h-6 w-6 mr-2" />
              Contact Inbox
            </h1>
            <button
              onClick={exportSubmissions}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Export submissions"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                {stats.by_status?.new || 0}
              </div>
              <div className="text-blue-600 dark:text-blue-300">New</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <div className="font-medium text-green-900 dark:text-green-100">
                {stats.by_status?.resolved || 0}
              </div>
              <div className="text-green-600 dark:text-green-300">Resolved</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <div className="flex space-x-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterVolunteerType}
                onChange={(e) => setFilterVolunteerType(e.target.value as FilterVolunteerType)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="attend">Attend</option>
                <option value="present">Present</option>
                <option value="organize">Organize</option>
                <option value="sponsor">Sponsor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No submissions found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => handleSubmissionClick(submission)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedSubmission?.id === submission.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                      : ''
                  } ${submission.status === 'open' ? 'bg-blue-25 dark:bg-blue-950' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(submission.status)}
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {submission.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(submission.priority)}`}>
                        {submission.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {submission.email}
                  </div>
                  
                  {submission.subject && (
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                      {submission.subject}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {submission.message}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{getVolunteerTypeLabel(submission.volunteer_type)}</span>
                    <span>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Submission Details */}
      <div className="flex-1 flex flex-col">
        {selectedSubmission ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {selectedSubmission.subject || 'Contact Submission'}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedSubmission.name}
                    </span>
                    <span>{selectedSubmission.email}</span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(selectedSubmission.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedSubmission.priority}
                    onChange={(e) => handlePriorityUpdate(selectedSubmission.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                  
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => handleStatusUpdate(selectedSubmission.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Volunteer Type Badge */}
              {selectedSubmission.volunteer_type && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <UserCheck className="h-4 w-4 mr-1" />
                    {getVolunteerTypeLabel(selectedSubmission.volunteer_type)}
                  </span>
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose max-w-none dark:prose-invert">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message:
                  </h3>
                  <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                    {selectedSubmission.message}
                  </div>
                </div>

                {selectedSubmission.response && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                      Response:
                    </h3>
                    <div className="whitespace-pre-wrap text-green-900 dark:text-green-100">
                      {selectedSubmission.response}
                    </div>
                    {selectedSubmission.responded_at && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Responded on {new Date(selectedSubmission.responded_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Response Form */}
                {selectedSubmission.status !== 'closed' && selectedSubmission.status !== 'spam' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Send Response
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // TODO: Implement response functionality
                    }}>
                      <textarea
                        rows={6}
                        placeholder="Type your response here..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Send Response
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a submission to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInboxPage;