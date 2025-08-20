import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Newspaper, User, CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminNewsPage: React.FC = () => {
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