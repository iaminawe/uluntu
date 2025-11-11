import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Users, Lock, Globe, Crown, CheckCircle, XCircle } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';

const AdminGroupsPage: React.FC = () => {
  // Check if groups feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const groupsEnabled = isFeatureEnabled('groups_communities');

  // Show loading while checking features
  if (featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show disabled message if feature is not enabled
  if (!groupsEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Groups Feature Disabled
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The groups & communities feature is currently disabled. Enable it in System Management → Features to access groups management.
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
      label: 'Group Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
          {item.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {item.description}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'privacy_level',
      label: 'Privacy',
      render: (value: string) => {
        const privacyConfig = {
          public: { icon: Globe, text: 'Public', color: 'bg-green-100 text-green-800' },
          private: { icon: Lock, text: 'Private', color: 'bg-red-100 text-red-800' },
          invite_only: { icon: Crown, text: 'Invite Only', color: 'bg-purple-100 text-purple-800' }
        };
        const config = privacyConfig[value as keyof typeof privacyConfig] || privacyConfig.public;
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.text}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'member_count',
      label: 'Members',
      render: (value: number) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {value || 0}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      ),
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="groups"
      entityName="Groups"
      columns={columns}
      searchFields={['name', 'description']}
      detailPath="/groups/:slug"
      editPath="/groups/:slug/edit"
      createPath="/groups/create"
    />
  );
};

export default AdminGroupsPage;