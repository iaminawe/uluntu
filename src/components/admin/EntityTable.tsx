import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Column<T = unknown> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface EntityTableProps<T = unknown> {
  entityType: string;
  entityName: string;
  columns: Column<T>[];
  searchFields?: string[];
  detailPath?: string;
  editPath?: string;
  createPath?: string;
  customActions?: (item: T) => React.ReactNode;
  customQuery?: (params: { searchTerm: string; currentPage: number; pageSize: number; sortBy: { column: string; direction: 'asc' | 'desc' } }) => Promise<{ items: T[]; total: number }>;
}

const EntityTable = <T extends { id: string } = any>({
  entityType,
  entityName,
  columns,
  searchFields = [],
  detailPath,
  editPath,
  createPath,
  customActions,
  customQuery
}: EntityTableProps<T>) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'created_at',
    direction: 'desc'
  });

  // Fetch entities
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-entities', entityType, searchTerm, currentPage, sortBy, !!customQuery],
    queryFn: async () => {
      if (customQuery) {
        return await customQuery({ searchTerm, currentPage, pageSize, sortBy });
      }

      let query = supabase
        .from(entityType as any)
        .select('*', { count: 'exact' });

      // Apply search
      if (searchTerm) {
        const searchConditions = searchFields
          .map(field => `${field}.ilike.%${searchTerm}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Apply sorting
      query = query.order(sortBy.column, { ascending: sortBy.direction === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return { items: (data || []) as unknown as T[], total: count || 0 };
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from(entityType as any)
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-entities', entityType] });
      setSelectedItems([]);
    }
  });

  // Export data
  const handleExport = async () => {
    const { data: allData } = await supabase
      .from(entityType as any)
      .select('*');

    if (!allData) return;

    // Convert to CSV
    const headers = columns.map(col => col.label).join(',');
    const rows = allData.map(item => 
      columns.map(col => {
        const value = (item as Record<string, any>)[col.key];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleSort = (column: string) => {
    if (!columns.find(col => col.key === column)?.sortable) return;

    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{entityName}</h2>
        <div className="flex items-center gap-2">
          {createPath && (
            <Link
              to={createPath}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Link>
          )}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${entityName.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedItems.length} items selected
          </span>
          <button
            onClick={() => {
              if (confirm(`Delete ${selectedItems.length} items?`)) {
                deleteMutation.mutate(selectedItems);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === data?.items.length && data?.items.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(data?.items.map(item => item.id) || []);
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && sortBy.column === column.key && (
                      <span className="ml-1">
                        {sortBy.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No {entityName.toLowerCase()} found
                </td>
              </tr>
            ) : (
              data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {column.render ? column.render((item as any)[column.key], item) : (item as any)[column.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-start gap-3">
                      {detailPath && (
                        <Link
                          to={detailPath
                            .replace(':id', item.id)
                            .replace(':slug', (item as any).slug || item.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      )}
                      {editPath && (
                        <Link
                          to={editPath
                            .replace(':id', item.id)
                            .replace(':slug', (item as any).slug || item.id)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      )}
                      {customActions && customActions(item)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, data?.total || 0)} of{' '}
            {data?.total || 0} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityTable;