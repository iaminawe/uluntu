import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Save, X, AlertCircle, Info, Trash2 } from 'lucide-react';
import Modal from '@/shared/components/ui/Modal/Modal';
import { MenuItem, MenuItemInput, MenuItemInputSchema } from '@/types/menu';
import { IconPicker } from './IconPicker';
import { MenuParentSelector } from './MenuParentSelector';
import { menuApi } from '@/services/menuApi';

// Enhanced validation schema for the modal
const MenuItemModalSchema = MenuItemInputSchema.extend({
  subtitle: z.string().max(200, 'Subtitle too long').optional(),
  custom_attributes: z.record(z.string()).optional(),
  auto_save_enabled: z.boolean().optional().default(true),
});

type MenuItemFormData = z.infer<typeof MenuItemModalSchema>;

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem?: MenuItem | null;
  parentMenuItems?: MenuItem[];
  onSave: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  mode?: 'create' | 'edit' | 'duplicate';
  defaultMenuType?: string;
}

interface DraftData {
  formData: Partial<MenuItemFormData>;
  timestamp: number;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  menuItem,
  parentMenuItems = [],
  onSave,
  onDelete,
  mode = 'create',
  defaultMenuType = 'main',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const isEditing = mode === 'edit' && !!menuItem;
  const isDuplicating = mode === 'duplicate' && !!menuItem;
  
  const modalTitle = useMemo(() => {
    if (isEditing) return `Edit Menu Item: ${menuItem?.title}`;
    if (isDuplicating) return `Duplicate Menu Item: ${menuItem?.title}`;
    return 'Create New Menu Item';
  }, [isEditing, isDuplicating, menuItem?.title]);

  // Draft management
  const draftKey = useMemo(() => 
    `menu-item-draft-${isEditing ? menuItem?.id : 'new'}`, 
    [isEditing, menuItem?.id]
  );

  // Form setup with validation
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
    reset,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(MenuItemModalSchema),
    defaultValues: {
      title: '',
      url: '',
      description: '',
      subtitle: '',
      menu_type: defaultMenuType as any,
      parent_id: null,
      sort_order: 0,
      is_enabled: true,
      target: '_self',
      icon: null,
      css_classes: null,
      visibility: 'public',
      required_roles: null,
      is_external: false,
      auto_save_enabled: true,
      custom_attributes: {},
    },
  });

  const watchedValues = watch();

  // Load draft on mount
  useEffect(() => {
    if (!isOpen) return;

    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && !isEditing) {
        const draft: DraftData = JSON.parse(savedDraft);
        // Only restore draft if it's less than 24 hours old
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          Object.entries(draft.formData).forEach(([key, value]) => {
            if (value !== undefined) {
              setValue(key as keyof MenuItemFormData, value);
            }
          });
          toast.success('Draft restored');
        }
      }
    } catch (error) {
      console.warn('Failed to restore draft:', error);
    }

    // Load existing item data
    if (menuItem) {
      const itemData = {
        title: menuItem.title,
        url: menuItem.url,
        description: menuItem.description || '',
        subtitle: '', // Add if your schema supports it
        menu_type: menuItem.menu_type,
        parent_id: menuItem.parent_id,
        sort_order: menuItem.sort_order,
        is_enabled: menuItem.is_enabled,
        target: menuItem.target,
        icon: menuItem.icon,
        css_classes: menuItem.css_classes,
        visibility: menuItem.visibility,
        required_roles: menuItem.required_roles,
        is_external: menuItem.is_external,
        auto_save_enabled: autoSaveEnabled,
        custom_attributes: {},
      };

      if (isDuplicating) {
        itemData.title = `Copy of ${itemData.title}`;
        itemData.url = ''; // Clear URL for duplicate
      }

      reset(itemData);
    }
  }, [isOpen, menuItem, isEditing, isDuplicating, draftKey, setValue, reset, autoSaveEnabled]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty || !isOpen || isEditing) return;

    const timeoutId = setTimeout(() => {
      const currentData = getValues();
      const draftData: DraftData = {
        formData: currentData,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.warn('Failed to save draft:', error);
      }
    }, 2000);

    setHasUnsavedChanges(true);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, autoSaveEnabled, isDirty, isOpen, isEditing, draftKey, getValues]);

  // URL validation with real-time checking
  const validateUrl = useCallback(async (url: string) => {
    if (!url) return 'URL is required';
    
    // Basic format validation
    const urlPattern = /^(https?:\/\/[^\s]+|\/[^\s]*|\#[^\s]*)$/;
    if (!urlPattern.test(url)) {
      return 'Please enter a valid URL (http://..., /path, or #anchor)';
    }

    // Check for external URLs
    const isExternal = /^https?:\/\//.test(url);
    setValue('is_external', isExternal);

    // Additional validation could include checking if internal URLs exist
    return true;
  }, [setValue]);

  // Form submission
  const onSubmit = async (data: MenuItemFormData) => {
    setIsLoading(true);
    try {
      const { auto_save_enabled, custom_attributes, subtitle, ...submitData } = data;
      
      let savedItem: MenuItem;
      
      if (isEditing && menuItem) {
        savedItem = await menuApi.updateMenuItem(menuItem.id, submitData);
        toast.success('Menu item updated successfully');
      } else {
        savedItem = await menuApi.createMenuItem(submitData);
        toast.success('Menu item created successfully');
      }

      // Clear draft
      localStorage.removeItem(draftKey);
      setHasUnsavedChanges(false);
      
      onSave(savedItem);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save menu item');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete confirmation
  const handleDelete = async () => {
    if (!menuItem?.id || !onDelete) return;

    setIsDeleting(true);
    try {
      await menuApi.deleteMenuItem(menuItem.id);
      onDelete(menuItem.id);
      toast.success('Menu item deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete menu item');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle modal close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && !isEditing) {
      if (confirm('You have unsaved changes. Do you want to close without saving?')) {
        localStorage.removeItem(draftKey);
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, isEditing, draftKey, onClose]);

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem(draftKey);
    setHasUnsavedChanges(false);
    setLastSaved(null);
    reset();
    toast.success('Draft cleared');
  };

  const modalFooter = (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {!isEditing && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Auto-save draft</span>
          </label>
        )}
        
        {lastSaved && (
          <span className="text-xs text-gray-500">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
        
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unsaved changes
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        {!isEditing && (
          <button
            type="button"
            onClick={clearDraft}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Clear Draft
          </button>
        )}
        
        {isEditing && onDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50"
            disabled={isLoading || isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1 inline" />
            Delete
          </button>
        )}
        
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          form="menu-item-form"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update' : 'Create'}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
        size="xl"
        footer={modalFooter}
        closeOnOutsideClick={!hasUnsavedChanges}
        className="max-h-[90vh] overflow-y-auto"
      >
        <form id="menu-item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({watch('title')?.length || 0}/255)
                  </span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter menu item title"
                  maxLength={255}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Subtitle Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                  <span className="text-xs text-gray-500 ml-2">
                    ({watch('subtitle')?.length || 0}/200)
                  </span>
                </label>
                <input
                  type="text"
                  {...register('subtitle')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional subtitle or tagline"
                  maxLength={200}
                />
                {errors.subtitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.subtitle.message}</p>
                )}
              </div>

              {/* URL Field with validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL <span className="text-red-500">*</span>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Info className="h-3 w-3 mr-1" />
                    Use /path for internal, https:// for external, or #anchor for page sections
                  </div>
                </label>
                <Controller
                  name="url"
                  control={control}
                  rules={{ validate: validateUrl }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        watch('is_external') ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                      }`}
                      placeholder="/internal-path or https://external-site.com"
                    />
                  )}
                />
                {watch('is_external') && (
                  <p className="mt-1 text-sm text-blue-600 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    External link detected
                  </p>
                )}
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.url.message}
                  </p>
                )}
              </div>

              {/* Description with Rich Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <span className="text-xs text-gray-500 ml-2">
                    ({watch('description')?.length || 0}/500)
                  </span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description for tooltips or accessibility"
                  maxLength={500}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Menu Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('menu_type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="main">Main Navigation</option>
                  <option value="footer">Footer</option>
                  <option value="mobile">Mobile Menu</option>
                  <option value="admin">Admin Panel</option>
                </select>
              </div>

              {/* Parent Menu Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Menu Item
                </label>
                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <MenuParentSelector
                      value={field.value}
                      onChange={field.onChange}
                      options={parentMenuItems}
                      excludeId={menuItem?.id}
                      menuType={watch('menu_type')}
                    />
                  )}
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <IconPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  {...register('sort_order', { valueAsNumber: true })}
                  min={0}
                  max={9999}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.sort_order && (
                  <p className="mt-1 text-sm text-red-600">{errors.sort_order.message}</p>
                )}
              </div>

              {/* Target Attribute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Target
                </label>
                <select
                  {...register('target')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="_self">Same window/tab</option>
                  <option value="_blank">New window/tab</option>
                  <option value="_parent">Parent frame</option>
                  <option value="_top">Full window</option>
                </select>
              </div>

              {/* Visibility Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  {...register('visibility')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public (everyone)</option>
                  <option value="authenticated">Authenticated users</option>
                  <option value="admin">Admin only</option>
                  <option value="role_based">Role-based</option>
                </select>
              </div>

              {/* Custom CSS Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS Classes
                  <span className="text-xs text-gray-500 ml-2">
                    ({watch('css_classes')?.length || 0}/500)
                  </span>
                </label>
                <input
                  type="text"
                  {...register('css_classes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="custom-class another-class"
                  maxLength={500}
                />
              </div>

              {/* Toggle Controls */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_enabled')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled (visible in navigation)</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Menu Item
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{menuItem?.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MenuItemModal;