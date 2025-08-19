import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertTriangle, Undo2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { MenuItem } from '@/types/menu';
import { adminActivityLogger } from '@/services/adminActivityLogger';

interface MenuItemToggleProps {
  item: MenuItem;
  onToggle: (itemId: string, enabled: boolean) => Promise<boolean>;
  onUndo?: (itemId: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
  showVisualIndicator?: boolean;
  confirmCritical?: boolean;
  className?: string;
}

interface ToggleState {
  isLoading: boolean;
  hasError: boolean;
  previousState?: boolean;
  canUndo: boolean;
}

export const MenuItemToggle: React.FC<MenuItemToggleProps> = ({
  item,
  onToggle,
  onUndo,
  disabled = false,
  showLabel = false,
  showVisualIndicator = true,
  confirmCritical = true,
  className
}) => {
  const [toggleState, setToggleState] = useState<ToggleState>({
    isLoading: false,
    hasError: false,
    canUndo: false
  });
  
  const [optimisticState, setOptimisticState] = useState(item.is_enabled);
  
  // Sync optimistic state with item changes
  useEffect(() => {
    setOptimisticState(item.is_enabled);
  }, [item.is_enabled]);

  // Auto-clear undo state after 10 seconds
  useEffect(() => {
    if (toggleState.canUndo) {
      const timer = setTimeout(() => {
        setToggleState(prev => ({ ...prev, canUndo: false }));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [toggleState.canUndo]);

  const handleToggle = async (newEnabled: boolean) => {
    // Check if this is a critical operation that needs confirmation
    const isCritical = item.menu_type === 'main' || (item.children && item.children.length > 0);
    
    if (confirmCritical && isCritical && !newEnabled) {
      const confirmed = window.confirm(
        `Disabling "${item.title}" will make it invisible to users${
          item.children?.length ? ' and may affect its child menu items' : ''
        }. Are you sure?`
      );
      if (!confirmed) return;
    }

    // Store previous state for undo functionality
    const previousState = optimisticState;
    
    // Optimistic update
    setOptimisticState(newEnabled);
    setToggleState({ isLoading: true, hasError: false, canUndo: false, previousState });
    
    try {
      // Call the toggle function
      const success = await onToggle(item.id, newEnabled);
      
      if (success) {
        // Log the action for audit trail
        await adminActivityLogger.log({
          action: `menu_item_${newEnabled ? 'enable' : 'disable'}`,
          entity_type: 'menu_item',
          entity_id: item.id,
          details: {
            item_title: item.title,
            menu_type: item.menu_type,
            previous_state: previousState,
            new_state: newEnabled
          }
        });

        setToggleState({ 
          isLoading: false, 
          hasError: false, 
          canUndo: true,
          previousState 
        });
        
        toast.success(
          `Menu item "${item.title}" ${newEnabled ? 'enabled' : 'disabled'}`,
          {
            duration: 4000,
            action: onUndo && {
              label: 'Undo',
              onClick: () => handleUndo()
            }
          } as any
        );
      } else {
        throw new Error('Toggle operation failed');
      }
    } catch (error) {
      console.error('Failed to toggle menu item:', error);
      
      // Rollback optimistic update
      setOptimisticState(previousState);
      setToggleState({ 
        isLoading: false, 
        hasError: true, 
        canUndo: false 
      });
      
      toast.error(
        `Failed to ${newEnabled ? 'enable' : 'disable'} "${item.title}". Please try again.`,
        { duration: 6000 }
      );
    }
  };

  const handleUndo = async () => {
    if (!toggleState.canUndo || toggleState.previousState === undefined) return;
    
    const undoState = toggleState.previousState;
    setToggleState(prev => ({ ...prev, canUndo: false }));
    
    if (onUndo) {
      onUndo(item.id);
    } else {
      await handleToggle(undoState);
    }
    
    toast.success(`Undid toggle for "${item.title}"`, { duration: 3000 });
  };

  const switchId = `menu-toggle-${item.id}`;
  const isDisabled = disabled || toggleState.isLoading;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Visual indicator for disabled state */}
      {showVisualIndicator && (
        <div className={cn(
          'w-2 h-2 rounded-full transition-colors',
          optimisticState ? 'bg-green-500' : 'bg-gray-400'
        )} />
      )}
      
      {/* Switch component */}
      <div className="relative">
        <Switch
          id={switchId}
          checked={optimisticState}
          onCheckedChange={handleToggle}
          disabled={isDisabled}
          className={cn(
            'transition-all duration-200',
            toggleState.hasError && 'ring-2 ring-red-500',
            toggleState.isLoading && 'opacity-70'
          )}
        />
        
        {/* Loading overlay */}
        {toggleState.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <label 
          htmlFor={switchId}
          className={cn(
            'text-sm font-medium cursor-pointer transition-colors',
            optimisticState ? 'text-green-700' : 'text-gray-500',
            isDisabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {optimisticState ? 'Enabled' : 'Disabled'}
        </label>
      )}

      {/* Status icon */}
      <div className="flex items-center space-x-1">
        {optimisticState ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        
        {/* Error indicator */}
        {toggleState.hasError && (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Undo button */}
      {toggleState.canUndo && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUndo}
          className="p-1 h-6 w-6"
          title={`Undo toggle for ${item.title}`}
        >
          <Undo2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// Keyboard navigation support
export const MenuItemToggleWithKeyboard: React.FC<MenuItemToggleProps & {
  onKeyDown?: (event: React.KeyboardEvent) => void;
}> = ({ onKeyDown, ...props }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onToggle(props.item.id, !props.item.is_enabled);
    }
    
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return (
    <div 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
      role="switch"
      aria-checked={props.item.is_enabled}
      aria-label={`Toggle ${props.item.title}`}
    >
      <MenuItemToggle {...props} />
    </div>
  );
};

export default MenuItemToggle;