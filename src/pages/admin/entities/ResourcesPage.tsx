import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { BookOpen, Tag, ExternalLink, CheckCircle, XCircle, Eye, Download } from 'lucide-react';

const AdminResourcesPage: React.FC = () => {
  const columns = [
    {
      key: 'title',
      label: 'Resource Title',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
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
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Tag className="w-3 h-3 mr-1" />
          {value}
        </span>
      ),
      sortable: true
    },
    {
      key: 'resource_type',
      label: 'Type',
      render: (value: string) => {
        const typeConfig = {
          article: { text: 'Article', color: 'bg-green-100 text-green-800' },
          video: { text: 'Video', color: 'bg-red-100 text-red-800' },
          document: { text: 'Document', color: 'bg-purple-100 text-purple-800' },
          link: { text: 'External Link', color: 'bg-blue-100 text-blue-800' },
          course: { text: 'Course', color: 'bg-orange-100 text-orange-800' }
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
      key: 'url',
      label: 'Link',
      render: (value: string) => value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View
        </a>
      ) : 'N/A'
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
      key: 'download_count',
      label: 'Downloads',
      render: (value: number) => (
        <div className="flex items-center">
          <Download className="w-4 h-4 mr-1 text-gray-500" />
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
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="resources"
      entityName="Resources"
      columns={columns}
      searchFields={['title', 'description', 'category', 'resource_type', 'tags']}
      detailPath="/resources/:id"
      editPath="/resources/:id/edit"
      createPath="/resources/create"
    />
  );
};

export default AdminResourcesPage;