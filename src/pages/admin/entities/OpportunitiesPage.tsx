import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Briefcase, MapPin, Clock, User, CheckCircle, XCircle, Eye, DollarSign, Lock } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';

const AdminOpportunitiesPage: React.FC = () => {
  // Check if opportunities feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const opportunitiesEnabled = isFeatureEnabled('opportunities_board');

  // Show loading while checking features
  if (featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show disabled message if feature is not enabled
  if (!opportunitiesEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Opportunities Board Feature Disabled
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The opportunities board feature is currently disabled. Enable it in System Management → Features to access opportunities management.
              </p>
              <a
                href="/admin/system/features"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700 transition-colors"
              >
                Go to Feature Management
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const columns = [
    {
      key: 'title',
      label: 'Opportunity Title',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
          {item.organization && (
            <div className="text-sm text-gray-500">
              {item.organization}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const typeConfig = {
          job: { text: 'Job', color: 'bg-green-100 text-green-800' },
          volunteer: { text: 'Volunteer', color: 'bg-blue-100 text-blue-800' },
          internship: { text: 'Internship', color: 'bg-purple-100 text-purple-800' },
          contract: { text: 'Contract', color: 'bg-orange-100 text-orange-800' },
          freelance: { text: 'Freelance', color: 'bg-yellow-100 text-yellow-800' }
        };
        const config = typeConfig[value as keyof typeof typeConfig] || { text: value, color: 'bg-gray-100 text-gray-800' };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.text}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string, item: any) => (
        <div>
          {value && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-500" />
              {value}
            </div>
          )}
          {item.remote && (
            <div className="text-sm text-blue-600">Remote Available</div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'compensation',
      label: 'Compensation',
      render: (value: string) => (
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
          {value || 'Not specified'}
        </div>
      ),
      sortable: true
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value: string) => {
        if (!value) return 'No deadline';
        const deadline = new Date(value);
        const now = new Date();
        const isExpired = deadline < now;
        
        return (
          <div className={`flex items-center ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            <Clock className="w-4 h-4 mr-1" />
            {deadline.toLocaleDateString()}
            {isExpired && <span className="ml-1 text-xs">(Expired)</span>}
          </div>
        );
      },
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, item: any) => {
        const deadline = item.deadline ? new Date(item.deadline) : null;
        const now = new Date();
        const isExpired = deadline && deadline < now;
        
        if (isExpired) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Expired
            </span>
          );
        }
        
        const isActive = value === 'published';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Published
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Draft
              </>
            )}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Posted',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="opportunities"
      entityName="Opportunities"
      columns={columns}
      searchFields={['title', 'description', 'organization', 'location', 'type']}
      detailPath="/opportunities/:slug"
      editPath="/opportunities/:slug/edit"
      createPath="/opportunities/create"
    />
  );
};

export default AdminOpportunitiesPage;