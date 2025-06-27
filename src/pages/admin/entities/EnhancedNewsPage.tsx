import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { TopicBadges } from '@/components/topics/TopicBadges';
import { Newspaper, Tag, User, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useEntityTopics } from '@/hooks/useTopics';

// Enhanced news item interface
interface NewsItemWithTopics {
  id: string;
  title: string;
  excerpt?: string;
  category: string;
  author_name: string;
  view_count: number;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
  created_at: string;
}

// Component to display topics for a news item
function NewsTopics({ newsId }: { newsId: string }) {
  const { topics, loading } = useEntityTopics('news', newsId);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-16" />;
  }

  if (topics.length === 0) {
    return <span className="text-gray-400 text-sm">No topics</span>;
  }

  return <TopicBadges topics={topics} size="sm" className="max-w-xs" maxDisplay={3} />;
}

const EnhancedNewsPage: React.FC = () => {
  const columns = [
    {
      key: 'title',
      label: 'Article Title',
      render: (value: string, item: NewsItemWithTopics) => (
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
      key: 'topics',
      label: 'Topics',
      render: (value: any, item: NewsItemWithTopics) => (
        <NewsTopics newsId={item.id} />
      ),
      sortable: false
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
      render: (value: boolean, item: NewsItemWithTopics) => {
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
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Topics Integration Active
        </h3>
        <p className="text-blue-800">
          This enhanced news admin page now shows topic associations. 
          Use the news editor to assign topics to articles.
        </p>
      </div>

      <EntityTable
        entityType="news"
        entityName="News Articles"
        columns={columns}
        searchFields={['title', 'excerpt', 'content', 'category', 'author_name']}
        detailPath="/news/:id"
        editPath="/news/:id/edit"
        createPath="/news/create"
      />
    </div>
  );
};

export default EnhancedNewsPage;