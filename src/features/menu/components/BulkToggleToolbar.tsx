import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { 
  CheckSquare, 
  Square, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Trash2,
  AlertTriangle,
  TreePine,
  Loader2,
  Settings,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { MenuItem } from '@/types/menu';
import { adminActivityLogger } from '@/services/adminActivityLogger';
import Modal from '@/shared/components/ui/Modal/Modal';
import ConfirmationModal from '@/shared/components/ui/Modal/ConfirmationModal';

interface BulkOperation {
  id: string;
  operation: 'enable' | 'disable' | 'delete';
  success: boolean;
  error?: string;
}

interface BulkToggleToolbarProps {
  items: MenuItem[];
  selectedItems: Set<string>;
  onSelectionChange: (selectedItems: Set<string>) => void;
  onBulkToggle: (itemIds: string[], enabled: boolean) => Promise<BulkOperation[]>;
  onBulkDelete?: (itemIds: string[]) => Promise<BulkOperation[]>;
  onBulkRestore?: (itemIds: string[]) => Promise<BulkOperation[]>;
  disabled?: boolean;
  showCascade?: boolean;
  className?: string;
}

interface ConfirmationState {
  isOpen: boolean;
  operation: 'enable' | 'disable' | 'delete' | null;
  cascade: boolean;
}

export const BulkToggleToolbar: React.FC<BulkToggleToolbarProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  onBulkToggle,
  onBulkDelete,
  onBulkRestore,
  disabled = false,
  showCascade = true,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cascadeEnabled, setCascadeEnabled] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    operation: null,
    cascade: false
  });
  const [lastOperation, setLastOperation] = useState<{
    operations: BulkOperation[];
    timestamp: Date;
  } | null>(null);

  // Calculate selection statistics
  const selectionStats = useMemo(() => {
    const selectedItemsList = items.filter(item => selectedItems.has(item.id));
    const enabledCount = selectedItemsList.filter(item => item.is_enabled).length;
    const disabledCount = selectedItemsList.length - enabledCount;
    const parentCount = selectedItemsList.filter(item => !item.parent_id).length;
    const childCount = selectedItemsList.filter(item => item.parent_id).length;
    
    return {
      total: selectedItems.size,
      enabled: enabledCount,
      disabled: disabledCount,
      parents: parentCount,
      children: childCount,
      canEnable: disabledCount > 0,
      canDisable: enabledCount > 0
    };
  }, [items, selectedItems]);

  // Get affected items including children if cascade is enabled
  const getAffectedItems = (cascade: boolean = false): string[] => {
    if (!cascade) {
      return Array.from(selectedItems);
    }

    const affectedIds = new Set<string>();
    
    // Add selected items
    selectedItems.forEach(id => affectedIds.add(id));
    
    // Add children of selected parents
    selectedItems.forEach(selectedId => {
      const selectedItem = items.find(item => item.id === selectedId);
      if (selectedItem && selectedItem.children) {
        selectedItem.children.forEach(child => affectedIds.add(child.id));
      }
    });

    return Array.from(affectedIds);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(item => item.id)));
    }
  };

  const handleSelectEnabled = () => {
    const enabledIds = items.filter(item => item.is_enabled).map(item => item.id);
    onSelectionChange(new Set(enabledIds));
  };

  const handleSelectDisabled = () => {
    const disabledIds = items.filter(item => !item.is_enabled).map(item => item.id);
    onSelectionChange(new Set(disabledIds));
  };

  const handleConfirmAction = (operation: 'enable' | 'disable' | 'delete', cascade: boolean = false) => {
    const affectedItems = getAffectedItems(cascade);
    const criticalCount = affectedItems.filter(id => {
      const item = items.find(i => i.id === id);
      return item && (item.menu_type === 'main' || item.children?.length);
    }).length;

    setConfirmation({
      isOpen: true,
      operation,
      cascade
    });
  };

  const executeOperation = async () => {
    if (!confirmation.operation) return;

    const affectedIds = getAffectedItems(confirmation.cascade);
    setIsLoading(true);

    try {
      let operations: BulkOperation[] = [];

      switch (confirmation.operation) {
        case 'enable':
          operations = await onBulkToggle(affectedIds, true);
          break;
        case 'disable':
          operations = await onBulkToggle(affectedIds, false);
          break;
        case 'delete':
          if (onBulkDelete) {
            operations = await onBulkDelete(affectedIds);
          }
          break;
      }

      // Log bulk operation
      await adminActivityLogger.logBulkAction(
        `menu_item_${confirmation.operation}`,
        'menu_item',
        affectedIds,
        {
          cascade_enabled: confirmation.cascade,
          success_count: operations.filter(op => op.success).length,
          failure_count: operations.filter(op => !op.success).length
        }
      );

      setLastOperation({ operations, timestamp: new Date() });

      // Show results
      const successCount = operations.filter(op => op.success).length;
      const failureCount = operations.filter(op => !op.success).length;

      if (failureCount === 0) {
        toast.success(
          `Successfully ${confirmation.operation}d ${successCount} menu item${successCount !== 1 ? 's' : ''}`,
          { duration: 4000 }
        );
      } else {
        toast.error(
          `${confirmation.operation} completed with ${failureCount} error${failureCount !== 1 ? 's' : ''}. ${successCount} item${successCount !== 1 ? 's' : ''} processed successfully.`,
          { duration: 6000 }
        );
      }

      // Clear selection after successful operation
      if (successCount > 0) {
        onSelectionChange(new Set());
      }

    } catch (error) {
      console.error(`Bulk ${confirmation.operation} failed:`, error);
      toast.error(
        `Failed to ${confirmation.operation} menu items. Please try again.`,
        { duration: 6000 }
      );
    } finally {
      setIsLoading(false);
      setConfirmation({ isOpen: false, operation: null, cascade: false });
    }
  };

  const handleUndo = async () => {
    if (!lastOperation || !onBulkRestore) return;
    
    const successfulIds = lastOperation.operations
      .filter(op => op.success)
      .map(op => op.id);
    
    if (successfulIds.length === 0) return;

    try {
      setIsLoading(true);
      await onBulkRestore(successfulIds);
      toast.success(`Undid changes for ${successfulIds.length} item${successfulIds.length !== 1 ? 's' : ''}`);
      setLastOperation(null);
    } catch (error) {
      toast.error('Failed to undo changes');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfirmationMessage = () => {
    const affectedIds = getAffectedItems(confirmation.cascade);
    const operation = confirmation.operation;
    const count = affectedIds.length;

    let message = `Are you sure you want to ${operation} ${count} menu item${count !== 1 ? 's' : ''}?`;
    
    if (confirmation.cascade && affectedIds.length > selectedItems.size) {
      const additionalCount = affectedIds.length - selectedItems.size;
      message += ` This will also affect ${additionalCount} child item${additionalCount !== 1 ? 's' : ''}.`;
    }

    if (operation === 'delete') {
      message += ' This action cannot be undone.';
    }

    return message;
  };

  if (selectedItems.size === 0) {
    return (
      <div className={cn('text-sm text-gray-500 p-4 text-center', className)}>
        Select menu items to enable bulk operations
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}>
        {/* Selection Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectionStats.total} item{selectionStats.total !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="text-sm text-blue-700">
              {selectionStats.enabled} enabled, {selectionStats.disabled} disabled
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-700"
          >
            <Settings className="h-4 w-4 mr-1" />
            Options
            <ChevronDown className={cn(
              'h-4 w-4 ml-1 transition-transform',
              showAdvanced && 'rotate-180'
            )} />
          </Button>
        </div>

        {/* Main Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => handleConfirmAction('enable', cascadeEnabled)}
            disabled={!selectionStats.canEnable || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            Enable Selected ({selectionStats.disabled})
          </Button>

          <Button
            size="sm"
            onClick={() => handleConfirmAction('disable', cascadeEnabled)}
            disabled={!selectionStats.canDisable || isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <EyeOff className="h-4 w-4 mr-1" />
            )}
            Disable Selected ({selectionStats.enabled})
          </Button>

          {onBulkDelete && (
            <Button
              size="sm"
              onClick={() => handleConfirmAction('delete', cascadeEnabled)}
              disabled={isLoading}
              variant="danger"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}

          {/* Undo button */}
          {lastOperation && onBulkRestore && (
            <Button
              size="sm"
              onClick={handleUndo}
              disabled={isLoading}
              variant="ghost"
              className="text-orange-600"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Undo Last Action
            </Button>
          )}
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="pt-2 border-t border-blue-200 space-y-3">
            {/* Selection Controls */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSelectAll}
                className="text-blue-700"
              >
                <Square className="h-4 w-4 mr-1" />
                {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSelectEnabled}
                className="text-green-600"
              >
                <Eye className="h-4 w-4 mr-1" />
                Select Enabled
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSelectDisabled}
                className="text-gray-600"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Select Disabled
              </Button>
            </div>

            {/* Cascade Option */}
            {showCascade && selectionStats.parents > 0 && (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={cascadeEnabled}
                  onCheckedChange={setCascadeEnabled}
                  id="cascade-toggle"
                />
                <label htmlFor="cascade-toggle" className="text-sm text-blue-900 cursor-pointer">
                  <TreePine className="h-4 w-4 inline mr-1" />
                  Apply changes to child items ({selectionStats.parents} parent{selectionStats.parents !== 1 ? 's' : ''} selected)
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ isOpen: false, operation: null, cascade: false })}
        onConfirm={executeOperation}
        title={`${confirmation.operation === 'delete' ? 'Delete' : confirmation.operation === 'enable' ? 'Enable' : 'Disable'} Menu Items`}
        message={getConfirmationMessage()}
        confirmText={confirmation.operation === 'delete' ? 'Delete' : 'Confirm'}
        type={confirmation.operation === 'delete' ? 'danger' : 'warning'}
        isLoading={isLoading}
      />
    </>
  );
};

export default BulkToggleToolbar;