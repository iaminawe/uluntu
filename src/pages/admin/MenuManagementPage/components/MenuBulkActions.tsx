/**
 * MenuBulkActions Component
 * Bulk operations toolbar for selected menu items
 */

import React from 'react';
import { Eye, EyeOff, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BulkOperationsProps } from '../types';

export const MenuBulkActions: React.FC<BulkOperationsProps> = ({
  selectedItems,
  onBulkEnable,
  onBulkDisable,
  onBulkDelete,
  onDeselectAll,
  isLoading
}) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkEnable}
            disabled={isLoading}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <Eye className="h-4 w-4 mr-1" />
            Enable All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkDisable}
            disabled={isLoading}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <EyeOff className="h-4 w-4 mr-1" />
            Disable All
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={onBulkDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDeselectAll}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
