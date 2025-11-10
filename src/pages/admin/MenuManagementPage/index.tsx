/**
 * Menu Management Page
 * Main orchestrator for menu administration with drag-drop functionality
 *
 * Refactored from 1,705-line monolith into modular components and hooks
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Plus, Settings, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import ConfirmationModal from '@/shared/components/ui/Modal/ConfirmationModal';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { MenuErrorFallback } from '@/components/ErrorBoundary/FeatureSpecificFallbacks';
import { MenuItem, MenuType, MenuItemInput, MenuItemUpdate } from '@/types/menu';

// Components
import { MenuTabPanel } from './components/MenuTabPanel';
import { MenuSearchFilter } from './components/MenuSearchFilter';
import { MenuBulkActions } from './components/MenuBulkActions';
import { MenuItemCard } from './components/MenuItemCard';
import { MenuItemEditor } from './components/MenuItemEditor';
import { MenuPreview } from './components/MenuPreview';
import { MenuStatistics } from './components/MenuStatistics';
import { MenuQuickActions } from './components/MenuQuickActions';

// Hooks
import { useMenuData } from './hooks/useMenuData';
import { useMenuMutations } from './hooks/useMenuMutations';
import { useMenuTree } from './hooks/useMenuTree';
import { useDragDrop } from './hooks/useDragDrop';
import { useMenuSelection } from './hooks/useMenuSelection';

const AdminMenuManagementPageContent: React.FC = () => {
  // Data fetching and security
  const {
    allMenuItems,
    isLoading,
    error,
    refetch,
    hasAdminAccess,
    userRoles,
    menuSecurity,
    secureMenuApi
  } = useMenuData();

  // Tab state
  const [activeTab, setActiveTab] = useState<MenuType>('main');

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | undefined>();

  // Menu tree management
  const {
    searchTerm,
    setSearchTerm,
    visibilityFilter,
    setVisibilityFilter,
    enabledFilter,
    setEnabledFilter,
    expandedItems,
    handleToggleExpand,
    currentTabItems,
    menuCounts,
    getParentOptionsForItem,
    getItemChildren
  } = useMenuTree({ allMenuItems, activeTab });

  // Mutations
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    reorderMutation
  } = useMenuMutations({ secureMenuApi, menuSecurity });

  // Drag-drop functionality
  const { handleDragEnd } = useDragDrop({
    currentItems: currentTabItems,
    activeTab,
    reorderMutation
  });

  // Selection and bulk operations
  const {
    selectedItems,
    selectedMenuItems,
    handleSelectItem,
    handleDeselectAll,
    handleBulkEnable,
    handleBulkDisable,
    handleBulkDelete
  } = useMenuSelection({
    allMenuItems,
    menuSecurity,
    toggleMutation,
    deleteMutation
  });

  /**
   * Event Handlers
   */

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditMode('edit');
    setEditModalOpen(true);
  };

  const handleCreateItem = () => {
    setEditingItem(undefined);
    setEditMode('create');
    setEditModalOpen(true);
  };

  const handleSaveItem = async (data: MenuItemInput | MenuItemUpdate) => {
    try {
      if (editMode === 'create') {
        await createMutation.mutateAsync(data as MenuItemInput);
      } else {
        await updateMutation.mutateAsync(data as MenuItemUpdate);
      }
    } catch (error) {
      // Error handling is done in the mutation
      throw error;
    }
  };

  const handleDeleteItem = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(undefined);
  };

  const handleToggleEnabled = (item: MenuItem, enabled: boolean) => {
    toggleMutation.mutate({ id: item.id, isEnabled: enabled });
  };

  const handleDuplicateItem = async (item: MenuItem) => {
    const duplicateData: MenuItemInput = {
      title: `${item.title} (Copy)`,
      url: item.url,
      description: item.description,
      menu_type: item.menu_type,
      parent_id: item.parent_id,
      sort_order: item.sort_order + 1,
      is_enabled: false, // Start disabled
      target: item.target,
      icon: item.icon,
      css_classes: item.css_classes,
      visibility: item.visibility,
      required_roles: item.required_roles,
      is_external: item.is_external
    };

    createMutation.mutate(duplicateData);
  };

  /**
   * Render Guards
   */

  // Permission check
  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You don't have permission to access menu management.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Required roles: Admin, Super Admin, or Menu Manager
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Your roles: {userRoles.join(', ') || 'None'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Menu
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Main Render
   */

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Menu Management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your site's navigation menus. Drag and drop to reorder items, create hierarchies, and
          control visibility.
        </p>
      </div>

      {/* Search and Filters */}
      <MenuSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
        enabledFilter={enabledFilter}
        onEnabledFilterChange={setEnabledFilter}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Bulk Operations */}
      <MenuBulkActions
        selectedItems={selectedMenuItems}
        onBulkEnable={handleBulkEnable}
        onBulkDisable={handleBulkDisable}
        onBulkDelete={handleBulkDelete}
        onDeselectAll={handleDeselectAll}
        isLoading={isLoading}
      />

      {/* Tab Navigation */}
      <MenuTabPanel activeTab={activeTab} onTabChange={setActiveTab} menuCounts={menuCounts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {activeTab === 'main' && 'Main Menu Items'}
              {activeTab === 'footer' && 'Footer Menu Items'}
              {activeTab === 'mobile' && 'Mobile Menu Items'}
            </h2>
            <Button onClick={handleCreateItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`${activeTab}-menu`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-[100px] rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading menu items...</span>
                    </div>
                  ) : (
                    currentTabItems.map((item, index) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        onToggleEnabled={handleToggleEnabled}
                        onDuplicate={handleDuplicateItem}
                        isSelected={selectedItems.includes(item.id)}
                        onSelect={handleSelectItem}
                        children={getItemChildren(item.id)}
                        isExpanded={expandedItems.includes(item.id)}
                        onToggleExpand={handleToggleExpand}
                        depth={0}
                      />
                    ))
                  )}
                  {provided.placeholder}
                  {!isLoading && currentTabItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No menu items found.</p>
                      <p className="text-sm">
                        Try adjusting your filters or click "Add Item" to get started.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Preview and Stats */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Preview */}
            <div className="sticky top-6">
              <MenuPreview items={currentTabItems} type={activeTab} />
            </div>

            {/* Statistics */}
            <MenuStatistics items={currentTabItems} />

            {/* Quick Actions */}
            <MenuQuickActions
              activeTab={activeTab}
              items={currentTabItems}
              onRefresh={refetch}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <MenuItemEditor
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        mode={editMode}
        menuType={activeTab}
        parentOptions={getParentOptionsForItem(editingItem)}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(undefined);
        }}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message={
          <div>
            <p>
              Are you sure you want to delete <strong>"{itemToDelete?.title}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. All child menu items will also be deleted.
            </p>
          </div>
        }
        confirmText="Delete Menu Item"
        cancelText="Cancel"
        type="danger"
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

/**
 * AdminMenuManagementPage - Wrapped with error boundary for graceful failure handling
 */
const AdminMenuManagementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FeatureErrorBoundary
      featureName="Menu Management"
      fallback={
        <MenuErrorFallback
          onRetry={() => window.location.reload()}
          onGoBack={() => navigate('/admin')}
        />
      }
    >
      <AdminMenuManagementPageContent />
    </FeatureErrorBoundary>
  );
};

export default AdminMenuManagementPage;
