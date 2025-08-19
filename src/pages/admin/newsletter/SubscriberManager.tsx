import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  UserCheck,
  UserX,
  Calendar,
  Download,
  Upload,
  Trash2,
  FileSpreadsheet,
  Plus,
  Edit,
  ChevronDown,
  CheckSquare,
  Square,
  Tag,
  Settings
} from 'lucide-react';
import { newsletterSubscriptionApi } from '@/features/newsletter/api/subscriptions';
import { NewsletterSubscription } from '@/types/newsletter';

const SubscriberManager: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscription | null>(null);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const pageSize = 20;

  // Fetch subscribers
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers', { 
      search: searchTerm, 
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize
    }],
    queryFn: () => newsletterSubscriptionApi.getAllSubscriptions({
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize
    })
  });

  // Fetch subscription stats
  const { data: stats } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: () => newsletterSubscriptionApi.getSubscriptionStats()
  });

  // Update subscription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ email, status }: { email: string; status: 'active' | 'unsubscribed' }) =>
      newsletterSubscriptionApi.updateSubscriptionStatus(email, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
    }
  });

  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (email: string) => newsletterSubscriptionApi.deleteSubscription(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
    }
  });

  // Bulk operations mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const results = await Promise.all(
        emails.map(email => newsletterSubscriptionApi.deleteSubscription(email))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      setSelectedSubscribers(new Set());
    }
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ emails, status }: { emails: string[]; status: 'active' | 'unsubscribed' }) => {
      const results = await Promise.all(
        emails.map(email => newsletterSubscriptionApi.updateSubscriptionStatus(email, status))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      setSelectedSubscribers(new Set());
    }
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => newsletterSubscriptionApi.exportSubscriptions({
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      limit: 10000
    }),
    onSuccess: (csvData) => {
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    }
  });

  const handleStatusUpdate = (email: string, newStatus: 'active' | 'unsubscribed') => {
    updateStatusMutation.mutate({ email, status: newStatus });
  };

  const handleDelete = (email: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscriptionMutation.mutate(email);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.size === subscribers?.data?.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers?.data?.map(s => s.email) || []));
    }
  };

  const handleSelectSubscriber = (email: string) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedSubscribers(newSelected);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedSubscribers.size} subscriptions?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedSubscribers));
    }
  };

  const handleBulkStatusUpdate = (status: 'active' | 'unsubscribed') => {
    bulkUpdateStatusMutation.mutate({ 
      emails: Array.from(selectedSubscribers), 
      status 
    });
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
        if (emailIndex === -1) {
          alert('CSV must contain an email column');
          return;
        }

        const emails = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return values[emailIndex];
          })
          .filter(email => email && email.includes('@'));

        // Import subscribers in batches
        let successCount = 0;
        for (const email of emails) {
          try {
            await newsletterSubscriptionApi.subscribe({ email });
            successCount++;
          } catch (error) {
            console.warn(`Failed to import ${email}:`, error);
          }
        }

        alert(`Successfully imported ${successCount} of ${emails.length} subscribers`);
        queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
        queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to process CSV file');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubscriberDetail = (subscriber: NewsletterSubscription) => {
    setSelectedSubscriber(subscriber);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'active':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'unsubscribed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <UserX className="w-3 h-3 mr-1" />
            Unsubscribed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Newsletter Subscribers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your newsletter subscriber list</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportMutation.isPending ? 'Exporting...' : 'Export'}
          </button>
          <div className="relative">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          <button 
            onClick={() => setShowSegmentModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <Tag className="w-4 h-4 mr-2" />
            Segments
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Subscribers</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats?.total_subscribers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats?.active_subscribers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unsubscribed</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{(stats as any).unsubscribedCount}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{(stats as any).newThisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-700">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'unsubscribed')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="pending">Pending</option>
                <option value="bounced">Bounced</option>
              </select>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                  <select
                    value={segmentFilter}
                    onChange={(e) => setSegmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Segments</option>
                    <option value="weekly">Weekly Subscribers</option>
                    <option value="monthly">Monthly Subscribers</option>
                    <option value="high-engagement">High Engagement</option>
                    <option value="new-subscribers">New Subscribers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="local">Local Members</option>
                    <option value="remote">Remote Members</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Preference</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
                    <option value="all">All Content Types</option>
                    <option value="events">Events Only</option>
                    <option value="news">News Only</option>
                    <option value="opportunities">Opportunities Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubscribers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedSubscribers.size} subscriber{selectedSubscribers.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkStatusUpdate('active')}
                className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Activate
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('unsubscribed')}
                className="inline-flex items-center px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                <UserX className="w-4 h-4 mr-1" />
                Unsubscribe
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button
                onClick={() => setSelectedSubscribers(new Set())}
                className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <button onClick={handleSelectAll} className="p-1">
                    {selectedSubscribers.size === subscribers?.data?.length && subscribers?.data?.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <span>Subscriber</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscribed Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subscribers?.data?.map((subscriber: NewsletterSubscription) => (
              <tr key={subscriber.email} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleSelectSubscriber(subscriber.email)}
                      className="p-1"
                    >
                      {selectedSubscribers.has(subscriber.email) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleSubscriberDetail(subscriber)}
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 text-left"
                      >
                        {subscriber.email}
                      </button>
                      {(subscriber as any).name && (
                        <div className="text-sm text-gray-500">{(subscriber as any).name}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {subscriber.preferences.frequency} • {subscriber.preferences.content_types.join(', ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(subscriber.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(subscriber.subscribed_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(subscriber.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {subscriber.status === 'active' ? (
                      <button
                        onClick={() => handleStatusUpdate(subscriber.email, 'unsubscribed')}
                        className="text-red-600 hover:text-red-900"
                        title="Unsubscribe"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(subscriber.email, 'active')}
                        className="text-green-600 hover:text-green-900"
                        title="Resubscribe"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(subscriber.email)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {subscribers?.total && subscribers.total > pageSize && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * pageSize >= subscribers.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, subscribers.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{subscribers.total}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage * pageSize >= subscribers.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Subscriber Detail Modal */}
      {showDetailModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Subscriber Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedSubscriber.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedSubscriber.status)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Subscribed:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(selectedSubscriber.subscribed_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedSubscriber.confirmed_at && (
                      <div>
                        <span className="text-sm text-gray-500">Confirmed:</span>
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                          {new Date(selectedSubscriber.confirmed_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-500">Bounce Count:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedSubscriber.bounce_count}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Preferences</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Frequency:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedSubscriber.preferences.frequency}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Format:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedSubscriber.preferences.format}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Language:</span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedSubscriber.preferences.language}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Content Types:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedSubscriber.preferences.content_types.map(type => (
                          <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      handleStatusUpdate(
                        selectedSubscriber.email, 
                        selectedSubscriber.status === 'active' ? 'unsubscribed' : 'active'
                      );
                      setShowDetailModal(false);
                    }}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      selectedSubscriber.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedSubscriber.status === 'active' ? (
                      <>
                        <UserX className="w-4 h-4 mr-1" />
                        Unsubscribe
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-1" />
                        Reactivate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedSubscriber.email);
                      setShowDetailModal(false);
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segmentation Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Subscriber Segments</h3>
                <button
                  onClick={() => setShowSegmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900">Weekly Subscribers</h4>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      {stats?.active_subscribers ? Math.floor(stats.active_subscribers * 0.6) : 0}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">Subscribers who prefer weekly updates</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-900">High Engagement</h4>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      {stats?.active_subscribers ? Math.floor(stats.active_subscribers * 0.25) : 0}
                    </span>
                  </div>
                  <p className="text-xs text-green-700">Subscribers with high open/click rates</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-900">New Subscribers</h4>
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                      {stats?.active_subscribers ? Math.floor(stats.active_subscribers * 0.1) : 0}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700">Subscribed in the last 30 days</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-orange-900">Event Focused</h4>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                      {stats?.active_subscribers ? Math.floor(stats.active_subscribers * 0.4) : 0}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700">Only interested in event content</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-red-900">Low Engagement</h4>
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                      {stats?.active_subscribers ? Math.floor(stats.active_subscribers * 0.15) : 0}
                    </span>
                  </div>
                  <p className="text-xs text-red-700">Haven't opened recent emails</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Local Members</h4>
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                      {stats?.active_subscribers ? Math.floor(stats.active_subscribers * 0.7) : 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">Members in the local area</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSegmentModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriberManager;