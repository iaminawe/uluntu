import React from 'react';
import { useNavigate } from 'react-router-dom';
import EntityTable from '@/components/admin/EntityTable';
import { FileText, Globe, Lock, Archive, Star, Shield, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const PagesAdminTable: React.FC = () => {
  const navigate = useNavigate();
  
  const columns = [
    {
      key: 'title',
      label: 'Page Title',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            {value}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {item.is_featured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
            {item.is_system && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                System
              </span>
            )}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'page_type',
      label: 'Type',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
          {value || 'standard'}
        </span>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusConfig = {
          published: { icon: Globe, color: 'green', label: 'Published' },
          draft: { icon: Lock, color: 'yellow', label: 'Draft' },
          archived: { icon: Archive, color: 'gray', label: 'Archived' }
        };
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'author',
      label: 'Author',
      render: (value: any, item: any) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.author?.name || 'Unknown'}
        </div>
      ),
      sortable: false
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      render: (value: string) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
      sortable: true
    }
  ];

  // Custom delete action for non-system pages
  const customActions = (item: any) => {
    if (item.is_system) {
      return null; // No delete for system pages
    }
    
    return (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
            try {
              const { error } = await supabase
                .from('pages')
                .delete()
                .eq('id', item.id);
              
              if (error) throw error;
              
              toast.success('Page deleted successfully');
              // The table will automatically refresh due to query invalidation in EntityTable
              window.location.reload(); // Force refresh to update the table
            } catch (error) {
              console.error('Error deleting page:', error);
              toast.error('Failed to delete page');
            }
          }
        }}
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    );
  };

  // Custom query to include author relationship
  const customQuery = async ({ searchTerm, currentPage, pageSize, sortBy }: any) => {
    let query = supabase
      .from('pages')
      .select(`
        *,
        author:members!author_id(name)
      `, { count: 'exact' });

    // Apply search
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    query = query.order(sortBy.column, { ascending: sortBy.direction === 'asc' });

    // Apply pagination
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { items: data || [], total: count || 0 };
  };

  return (
    <EntityTable
      entityType="pages"
      entityName="Pages Management"
      columns={columns}
      searchFields={['title', 'slug', 'content']}
      detailPath="/pages/:slug"
      editPath="/admin/pages/:id/edit"
      createPath="/admin/pages/new"
      customActions={customActions}
      customQuery={customQuery}
    />
  );
};

export default PagesAdminTable;