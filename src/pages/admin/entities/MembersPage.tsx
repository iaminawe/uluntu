import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { CheckCircle, XCircle, User, Lock } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';

const AdminMembersPage: React.FC = () => {
  // Check if members directory feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const membersEnabled = isFeatureEnabled('members_directory');

  // Show loading while checking features
  if (featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show disabled message if feature is not enabled
  if (!membersEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Members Directory Feature Disabled
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The members directory feature is currently disabled. Enable it in System Management → Features to access member management.
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
      key: 'name',
      label: 'Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            {item.name}
          </div>
          <div className="text-sm text-gray-500">
            {item.user_id ? 'Registered User' : 'Profile Only'}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true
    },
    {
      key: 'title',
      label: 'Job Title',
      sortable: true
    },
    {
      key: 'company',
      label: 'Company',
      render: (value: string) => value || '-',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'published' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'published' ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Published
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              {value || 'Draft'}
            </>
          )}
        </span>
      ),
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="members"
      entityName="Members"
      columns={columns}
      searchFields={['name', 'title', 'location', 'company']}
      detailPath="/directory/:id"
      editPath="/directory/:id/edit"
      createPath="/directory/create"
    />
  );
};

export default AdminMembersPage;