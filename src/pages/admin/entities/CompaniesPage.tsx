import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Building, MapPin, Users, CheckCircle, XCircle, Lock } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';

const AdminCompaniesPage: React.FC = () => {
  // Check if companies feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const companiesEnabled = isFeatureEnabled('companies_listing');

  // Show loading while checking features
  if (featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show disabled message if feature is not enabled
  if (!companiesEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Companies Feature Disabled
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The companies listing feature is currently disabled. Enable it in System Management → Features to access companies management.
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
      label: 'Company Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Building className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            {value}
          </div>
          {item.website && (
            <div className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              <a href={item.website} target="_blank" rel="noopener noreferrer">
                {item.website}
              </a>
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'size',
      label: 'Company Size',
      render: (value: string) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_verified',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
        }`}>
          {value ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Pending
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
      entityType="companies"
      entityName="Companies"
      columns={columns}
      searchFields={['name', 'location', 'description']}
      detailPath="/companies/:slug"
      editPath="/companies/:slug/edit"
      createPath="/companies/create"
    />
  );
};

export default AdminCompaniesPage;