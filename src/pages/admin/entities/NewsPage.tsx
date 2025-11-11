import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Newspaper, User, CheckCircle, XCircle, Eye, Lock } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';

const AdminNewsPage: React.FC = () => {
  // Check if news feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const newsEnabled = isFeatureEnabled('news_blog');

  // Show loading while checking features
  if (featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show disabled message if feature is not enabled
  if (!newsEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                News & Blog Feature Disabled
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The news & blog feature is currently disabled. Enable it in System Management → Features to access news management.
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
      label: 'Article Title',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Newspaper className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
          {item.excerpt && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {item.excerpt}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'author_name',
      label: 'Author',
      render: (value: string) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1 text-gray-500" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'view_count',
      label: 'Views',
      render: (value: number) => (
        <div className="flex items-center">
          <Eye className="w-4 h-4 mr-1 text-gray-500" />
          {value || 0}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (value: boolean, item: any) => {
        if (item.is_featured) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Featured
            </span>
          );
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {value ? (
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
      key: 'published_at',
      label: 'Published',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Not published',
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="news"
      entityName="News Articles"
      columns={columns}
      searchFields={['title', 'excerpt', 'content', 'author_name']}
      detailPath="/news/:slug"
      editPath="/news/:id/edit"
      createPath="/news/create"
    />
  );
};

export default AdminNewsPage;