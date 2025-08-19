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
  TrendingUp,
  Clock,
  Settings,
  Play,
  Pause,
  BarChart3,
  TestTube,
  FileText,
  Palette,
  Target,
  CalendarDays
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
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<NewsletterCampaign | null>(null);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subject: '',
    template_id: '',
    custom_message: '',
    send_type: 'manual' as 'manual' | 'scheduled',
    scheduled_at: '',
    ab_test: {
      enabled: false,
      variant_b_subject: '',
      test_percentage: 20,
      winner_criteria: 'open_rate' as 'open_rate' | 'click_rate'
    }
  });

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

  // Schedule campaign mutation
  const scheduleMutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: Date }) => 
      newsletterCampaignApi.scheduleCampaign(id, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      setShowScheduleModal(false);
      setSelectedCampaign(null);
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: any) => newsletterCampaignApi.createCampaign(campaignData),
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      setShowCreationWizard(false);
      setCampaignForm({
        title: '',
        subject: '',
        template_id: '',
        custom_message: '',
        send_type: 'manual',
        scheduled_at: '',
        ab_test: {
          enabled: false,
          variant_b_subject: '',
          test_percentage: 20,
          winner_criteria: 'open_rate'
        }
      });
      setWizardStep(1);
      if (newCampaign) {
        navigate(`/admin/newsletter/campaigns/${newCampaign.id}/edit`);
      }
    }
  });

  // Fetch templates for creation wizard
  const { data: templates } = useQuery({
    queryKey: ['newsletter-templates'],
    queryFn: async () => {
      // Mock templates for now
      return [
        { id: '1', name: 'Newsletter Digest', description: 'Weekly digest template' },
        { id: '2', name: 'Event Announcement', description: 'Event-focused template' },
        { id: '3', name: 'News Update', description: 'News and updates template' }
      ];
    }
  });

  // Preview campaign mutation
  const previewMutation = useMutation({
    mutationFn: (id: string) => newsletterCampaignApi.previewCampaign(id),
    onSuccess: (preview) => {
      if (preview) {
        // Handle preview display
        console.log('Preview generated:', preview);
      }
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
      status: status === 'all' ? undefined : status as 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled',
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

  const handleSchedule = (campaign: NewsletterCampaign) => {
    setSelectedCampaign(campaign);
    setShowScheduleModal(true);
  };

  const handlePreview = (campaign: NewsletterCampaign) => {
    setPreviewCampaign(campaign);
    setShowPreviewModal(true);
    previewMutation.mutate(campaign.id);
  };

  const handleCreateCampaign = () => {
    const campaignData = {
      title: campaignForm.title,
      subject: campaignForm.subject,
      template_id: campaignForm.template_id,
      custom_message: campaignForm.custom_message,
      scheduled_at: campaignForm.send_type === 'scheduled' ? campaignForm.scheduled_at : undefined,
      // Add A/B test data if enabled
      ...(campaignForm.ab_test.enabled && {
        ab_test_config: {
          variant_b_subject: campaignForm.ab_test.variant_b_subject,
          test_percentage: campaignForm.ab_test.test_percentage,
          winner_criteria: campaignForm.ab_test.winner_criteria
        }
      })
    };
    createCampaignMutation.mutate(campaignData);
  };

  const nextWizardStep = () => {
    if (wizardStep < 4) {
      setWizardStep(wizardStep + 1);
    } else {
      handleCreateCampaign();
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Newsletter Campaigns</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and send newsletter campaigns
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreationWizard(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
          <Link
            to="/admin/newsletter/templates"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <Palette className="h-4 w-4" />
            <span>Templates</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading campaigns...</p>
          </div>
        ) : campaignsData?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No campaigns found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first newsletter campaign'
              }
            </p>
            <button
              onClick={() => setShowCreationWizard(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaignsData?.data?.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {campaign.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
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
                        
                        <button
                          onClick={() => handlePreview(campaign)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleSchedule(campaign)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Schedule"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSend(campaign)}
                              className="text-green-600 hover:text-green-900"
                              title="Send Now"
                              disabled={sendMutation.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {campaign.status === 'sent' && (
                          <Link
                            to={`/admin/newsletter/campaigns/${campaign.id}/analytics`}
                            className="text-orange-600 hover:text-orange-900"
                            title="Analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Link>
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

      {/* Campaign Creation Wizard */}
      {showCreationWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
                <button
                  onClick={() => {
                    setShowCreationWizard(false);
                    setWizardStep(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="mt-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((step, index) => (
                    <React.Fragment key={step}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        step <= wizardStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {index < 3 && (
                        <div className={`flex-1 h-1 mx-2 ${
                          step < wizardStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Basic Info</span>
                  <span>Template</span>
                  <span>Settings</span>
                  <span>Review</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              {/* Step 1: Basic Information */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Title
                      </label>
                      <input
                        type="text"
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter campaign title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        value={campaignForm.subject}
                        onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Message (Optional)
                      </label>
                      <textarea
                        value={campaignForm.custom_message}
                        onChange={(e) => setCampaignForm({ ...campaignForm, custom_message: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a custom message to your newsletter"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Template Selection */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Choose Template</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates?.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setCampaignForm({ ...campaignForm, template_id: template.id })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          campaignForm.template_id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h5 className="font-medium text-gray-900">{template.name}</h5>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Settings */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Campaign Settings</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Send Type
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setCampaignForm({ ...campaignForm, send_type: 'manual' })}
                          className={`p-4 border-2 rounded-lg text-left ${
                            campaignForm.send_type === 'manual' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <Send className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium">Send Now</span>
                          </div>
                          <p className="text-sm text-gray-600">Send immediately after creation</p>
                        </button>
                        <button
                          onClick={() => setCampaignForm({ ...campaignForm, send_type: 'scheduled' })}
                          className={`p-4 border-2 rounded-lg text-left ${
                            campaignForm.send_type === 'scheduled' 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <Clock className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium">Schedule</span>
                          </div>
                          <p className="text-sm text-gray-600">Schedule for later</p>
                        </button>
                      </div>
                    </div>

                    {campaignForm.send_type === 'scheduled' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Schedule Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={campaignForm.scheduled_at}
                          onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_at: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-medium text-gray-900">A/B Testing</h5>
                          <p className="text-sm text-gray-600">Test different subject lines to optimize performance</p>
                        </div>
                        <button
                          onClick={() => setCampaignForm({
                            ...campaignForm,
                            ab_test: { ...campaignForm.ab_test, enabled: !campaignForm.ab_test.enabled }
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            campaignForm.ab_test.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            campaignForm.ab_test.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      {campaignForm.ab_test.enabled && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Variant B Subject Line
                            </label>
                            <input
                              type="text"
                              value={campaignForm.ab_test.variant_b_subject}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm,
                                ab_test: { ...campaignForm.ab_test, variant_b_subject: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Alternative subject line"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Percentage
                              </label>
                              <select
                                value={campaignForm.ab_test.test_percentage}
                                onChange={(e) => setCampaignForm({
                                  ...campaignForm,
                                  ab_test: { ...campaignForm.ab_test, test_percentage: Number(e.target.value) }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value={10}>10%</option>
                                <option value={20}>20%</option>
                                <option value={30}>30%</option>
                                <option value={50}>50%</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Winner Criteria
                              </label>
                              <select
                                value={campaignForm.ab_test.winner_criteria}
                                onChange={(e) => setCampaignForm({
                                  ...campaignForm,
                                  ab_test: { ...campaignForm.ab_test, winner_criteria: e.target.value as 'open_rate' | 'click_rate' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="open_rate">Open Rate</option>
                                <option value="click_rate">Click Rate</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900">Review Campaign</h4>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Title:</span>
                      <p className="text-gray-900">{campaignForm.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subject:</span>
                      <p className="text-gray-900">{campaignForm.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Template:</span>
                      <p className="text-gray-900">{templates?.find(t => t.id === campaignForm.template_id)?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Send Type:</span>
                      <p className="text-gray-900 capitalize">{campaignForm.send_type}</p>
                    </div>
                    {campaignForm.send_type === 'scheduled' && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Scheduled For:</span>
                        <p className="text-gray-900">{new Date(campaignForm.scheduled_at).toLocaleString()}</p>
                      </div>
                    )}
                    {campaignForm.ab_test.enabled && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">A/B Test:</span>
                        <p className="text-gray-900">
                          Testing {campaignForm.ab_test.test_percentage}% with variant subject: "{campaignForm.ab_test.variant_b_subject}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={prevWizardStep}
                disabled={wizardStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={nextWizardStep}
                disabled={createCampaignMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {wizardStep === 4 ? (createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign') : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Campaign Modal */}
      {showScheduleModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Schedule Campaign</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Campaign: {selectedCampaign.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      if (e.target.value) {
                        scheduleMutation.mutate({
                          id: selectedCampaign.id,
                          scheduledAt: new Date(e.target.value)
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedCampaign(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Preview: {previewCampaign.title}</h3>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewCampaign(null);
                  }}
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
              <div className="bg-gray-100 rounded-lg p-8">
                <div className="bg-white rounded shadow max-w-2xl mx-auto">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{previewCampaign.subject}</h2>
                    <div className="prose prose-sm max-w-none">
                      <p>This is a preview of your newsletter campaign. The actual content will be generated based on your selected template and current community content.</p>
                      <p className="text-gray-600 italic">{previewCampaign.custom_message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewCampaign(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;