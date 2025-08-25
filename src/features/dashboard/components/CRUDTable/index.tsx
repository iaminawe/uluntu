import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  CheckCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ColumnDefinition<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface ActionDefinition<T> {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: 'default' | 'danger';
}

interface CRUDTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  actions: ActionDefinition<T>[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onBulkAction: (action: string, items: T[]) => void;
  loading?: boolean;
  className?: string;
}

const getValueByPath = <T,>(obj: T, path: string): any => {
  return path.split('.').reduce((value: any, key: string) => value?.[key], obj);
};

export function CRUDTable<T extends { id: string }>({
  data,
  columns,
  actions,
  onEdit,
  onDelete,
  onBulkAction,
  loading = false,
  className
}: CRUDTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = getValueByPath(a, sortConfig.key);
      const bVal = getValueByPath(b, sortConfig.key);

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const toggleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (selectedItems.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const items = data.filter(item => selectedItems.has(item.id));
                  onBulkAction('delete', items);
                  setSelectedItems(new Set());
                }}
                className="px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600 dark:border-slate-600 dark:bg-slate-700"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    )}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-orange-500">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {sortedData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
                    selectedItems.has(item.id) && "bg-orange-50 dark:bg-orange-900/20"
                  )}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600 dark:border-slate-600 dark:bg-slate-700"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {column.render ? column.render(item) : getValueByPath(item, column.key)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // For now, just show edit and delete options
                          const menu = e.currentTarget.nextElementSibling as HTMLElement;
                          menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-10 hidden">
                        <div className="py-1">
                          <button
                            onClick={() => onEdit(item)}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(item)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CRUDTable;