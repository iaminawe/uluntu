import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Edit, 
  Send, 
  Copy, 
  Trash2, 
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Users,
  TrendingUp
} from 'lucide-react';
import { newsletterCampaignApi } from '@/features/newsletter/api/campaigns';
import { NewsletterCampaign, CampaignFilters } from '@/types/newsletter';

const CampaignManager: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<CampaignFilters>({
    limit: 20,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch campaigns
  const { data: campaignsData, isLoading, refetch } = useQuery({
    queryKey: ['newsletter-campaigns', filters],
    queryFn: () => newsletterCampaignApi.getCampaigns(filters)
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsletterCampaignApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
    }
  });

  // Duplicate campaign mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => newsletterCampaignApi.duplicateCampaign(id),
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      if (newCampaign) {
        navigate(`/admin/newsletter/campaigns/${newCampaign.id}/edit`);
      }
    }
  });

  // Send campaign mutation
  const sendMutation = useMutation({
    mutationFn: (id: string) => newsletterCampaignApi.sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
    }
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      offset: 0
    }));
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as unknown,
      offset: 0
    }));
  };

  const handleDelete = async (campaign: NewsletterCampaign) => {
    if (campaign.status === 'sent') {
      alert('Cannot delete sent campaigns');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${campaign.title}"?`)) {
      deleteMutation.mutate(campaign.id);
    }
  };

  const handleDuplicate = (campaign: NewsletterCampaign) => {
    duplicateMutation.mutate(campaign.id);
  };

  const handleSend = async (campaign: NewsletterCampaign) => {
    if (campaign.status !== 'draft') {
      alert('Only draft campaigns can be sent');
      return;
    }
    
    if (confirm(`Are you sure you want to send "${campaign.title}" to all active subscribers?`)) {
      sendMutation.mutate(campaign.id);
    }
  };

  const getStatusBadge = (status: NewsletterCampaign['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return badges[status] || badges.draft;
  };

  const getStatusIcon = (status: NewsletterCampaign['status']) => {
    switch (status) {
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'sending':
        return <Send className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Campaigns</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, manage, and send newsletter campaigns
          </p>
        </div>
        <Link
          to="/admin/newsletter/campaigns/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading campaigns...</p>
          </div>
        ) : campaignsData?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first newsletter campaign'
              }
            </p>
            <Link
              to="/admin/newsletter/campaigns/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
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
                {campaignsData?.data?.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.subject}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 capitalize">{campaign.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {campaign.recipient_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {campaign.status === 'sent' && campaign.delivery_stats ? (
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-green-600">
                            <Eye className="h-4 w-4 mr-1" />
                            {campaign.delivery_stats.sent > 0 
                              ? Math.round((campaign.delivery_stats.opened / campaign.delivery_stats.sent) * 100) 
                              : 0}%
                          </div>
                          <div className="flex items-center text-blue-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {campaign.delivery_stats.opened > 0 
                              ? Math.round((campaign.delivery_stats.clicked / campaign.delivery_stats.opened) * 100) 
                              : 0}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.sent_at 
                        ? `Sent ${new Date(campaign.sent_at).toLocaleDateString()}`
                        : campaign.scheduled_at
                        ? `Scheduled ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                        : `Created ${new Date(campaign.created_at).toLocaleDateString()}`
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/newsletter/campaigns/${campaign.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        {campaign.status === 'draft' && (
                          <Link
                            to={`/admin/newsletter/campaigns/${campaign.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        
                        <button
                          onClick={() => handleDuplicate(campaign)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Duplicate"
                          disabled={duplicateMutation.isPending}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSend(campaign)}
                            className="text-green-600 hover:text-green-900"
                            title="Send Now"
                            disabled={sendMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        
                        {campaign.status !== 'sent' && (
                          <button
                            onClick={() => handleDelete(campaign)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {campaignsData && campaignsData.total_pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, prev.offset! - prev.limit!) }))}
              disabled={filters.offset === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + prev.limit! }))}
              disabled={(filters.offset || 0) + filters.limit! >= campaignsData.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(filters.offset || 0) + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min((filters.offset || 0) + filters.limit!, campaignsData.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{campaignsData.total}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, prev.offset! - prev.limit!) }))}
                  disabled={filters.offset === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + prev.limit! }))}
                  disabled={(filters.offset || 0) + filters.limit! >= campaignsData.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;