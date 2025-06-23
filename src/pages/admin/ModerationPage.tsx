import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminModerationApi } from '@/features/admin/api/moderation';
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { ModerationItem } from '@/types/admin';

const ModerationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch moderation queue
  const { data: moderationData, isLoading, refetch } = useQuery({
    queryKey: ['moderation-queue', selectedStatus, selectedEntityType],
    queryFn: () => adminModerationApi.getModerationQueue({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      entityType: selectedEntityType === 'all' ? undefined : selectedEntityType
    })
  });

  // Fetch moderation stats
  const { data: stats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: () => adminModerationApi.getModerationStats()
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ itemId, notes }: { itemId: string; notes?: string }) =>
      adminModerationApi.approveItem(itemId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
      setShowDetailModal(false);
      setReviewNotes('');
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ itemId, notes }: { itemId: string; notes: string }) =>
      adminModerationApi.rejectItem(itemId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
      setShowDetailModal(false);
      setReviewNotes('');
    }
  });

  const entityTypes = [
    'all',
    'members',
    'companies',
    'groups',
    'events',
    'news',
    'resources',
    'marketplace',
    'opportunities'
  ];

  const getEntityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      members: '👤',
      companies: '🏢',
      groups: '👥',
      events: '📅',
      news: '📰',
      resources: '📚',
      marketplace: '🛍️',
      opportunities: '💼'
    };
    return icons[type] || '📦';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Create',
      update: 'Update',
      delete: 'Delete'
    };
    return labels[action] || action;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and moderate user-submitted content
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                {stats.totalPending} items pending review
              </p>
              <div className="mt-1 text-xs text-yellow-700">
                {Object.entries(stats.byType).map(([type, counts]) => (
                  <span key={type} className="mr-4">
                    {type}: {counts.pending} pending
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as unknown)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={selectedEntityType}
          onChange={(e) => setSelectedEntityType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {entityTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading moderation queue...
                </td>
              </tr>
            ) : moderationData?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No items found
                </td>
              </tr>
            ) : (
              moderationData?.data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getEntityIcon(item.entity_type)}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.entity_type.charAt(0).toUpperCase() + item.entity_type.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getActionLabel(item.action_type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.submitted_by_user?.email || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Review {selectedItem.entity_type} {getActionLabel(selectedItem.action_type)}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Item Details */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedItem.entity_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Action</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getActionLabel(selectedItem.action_type)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedItem.submitted_by_user?.email || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(selectedItem.created_at).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Content Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Content</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedItem.content, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Review Notes */}
              {selectedItem.status === 'pending' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes (optional for approval, required for rejection)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about your decision..."
                  />
                </div>
              )}

              {/* Previous Review */}
              {selectedItem.status !== 'pending' && selectedItem.review_notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Review Decision</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedItem.review_notes}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed by {selectedItem.reviewed_by_user?.email} on{' '}
                      {selectedItem.reviewed_at && new Date(selectedItem.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setReviewNotes('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              {selectedItem.status === 'pending' && (
                <>
                  <button
                    onClick={() => rejectMutation.mutate({
                      itemId: selectedItem.id,
                      notes: reviewNotes || 'Content does not meet guidelines'
                    })}
                    disabled={!reviewNotes}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({
                      itemId: selectedItem.id,
                      notes: reviewNotes
                    })}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPage;