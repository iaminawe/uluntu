import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  MenuItem, 
  CreateMenuItemInput, 
  UpdateMenuItemInput,
  menuManagementApi 
} from '@/features/admin/api/menuManagement';

interface MenuManagementFormProps {
  menuItem?: MenuItem;
  parentOptions: MenuItem[];
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

interface FormData {
  label: string;
  href: string;
  description: string;
  parent_id: string | null;
  icon: string;
  feature_flag: string;
  is_enabled: boolean;
  order_index: number;
}

export const MenuManagementForm: React.FC<MenuManagementFormProps> = ({
  menuItem,
  parentOptions,
  onSave,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!menuItem;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      label: menuItem?.label || '',
      href: menuItem?.href || '',
      description: menuItem?.description || '',
      parent_id: menuItem?.parent_id || null,
      icon: menuItem?.icon || '',
      feature_flag: menuItem?.feature_flag || '',
      is_enabled: menuItem?.is_enabled ?? true,
      order_index: menuItem?.order_index || 0,
    },
  });

  useEffect(() => {
    if (menuItem) {
      reset({
        label: menuItem.label,
        href: menuItem.href,
        description: menuItem.description || '',
        parent_id: menuItem.parent_id,
        icon: menuItem.icon || '',
        feature_flag: menuItem.feature_flag || '',
        is_enabled: menuItem.is_enabled,
        order_index: menuItem.order_index,
      });
    }
  }, [menuItem, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      let result: MenuItem;

      if (isEditing) {
        const updateData: UpdateMenuItemInput = {
          id: menuItem!.id,
          ...data,
          parent_id: data.parent_id || null,
        };
        result = await menuManagementApi.updateMenuItem(updateData);
        toast.success('Menu item updated successfully');
      } else {
        const createData: CreateMenuItemInput = {
          ...data,
          parent_id: data.parent_id || null,
        };
        result = await menuManagementApi.createMenuItem(createData);
        toast.success('Menu item created successfully');
      }

      onSave(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save menu item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  // Available feature flags (this could come from API or config)
  const availableFeatureFlags = [
    'events_system',
    'members_directory',
    'companies_listing',
    'opportunities_board',
    'marketplace',
    'resources_library',
    'groups_communities',
    'news_blog',
    'photo_galleries',
    'community_features',
  ];

  // Available icons (simplified list - in real app might come from icon library)
  const availableIcons = [
    'users',
    'calendar',
    'building',
    'briefcase',
    'book',
    'news',
    'photo',
    'map',
    'home',
    'info',
    'settings',
    'help',
    'mail',
    'phone',
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="menu-management-form">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Menu Item' : 'Create Menu Item'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label *
          </label>
          <input
            type="text"
            {...register('label', { 
              required: 'Label is required',
              minLength: { value: 1, message: 'Label must not be empty' },
              maxLength: { value: 100, message: 'Label must be 100 characters or less' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Menu item label"
            data-testid="label-input"
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600" data-testid="label-error">
              {errors.label.message}
            </p>
          )}
        </div>

        {/* Href */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL/Path *
          </label>
          <input
            type="text"
            {...register('href', { 
              required: 'URL/Path is required',
              pattern: {
                value: /^(\/|https?:\/\/)/,
                message: 'URL must start with / or http(s)://'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/path or https://example.com"
            data-testid="href-input"
          />
          {errors.href && (
            <p className="mt-1 text-sm text-red-600" data-testid="href-error">
              {errors.href.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 255, message: 'Description must be 255 characters or less' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description for the menu item"
            rows={3}
            data-testid="description-input"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" data-testid="description-error">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Parent Menu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Menu
          </label>
          <select
            {...register('parent_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="parent-select"
          >
            <option value="">None (Top Level)</option>
            {parentOptions
              .filter(option => option.id !== menuItem?.id) // Prevent self-parenting
              .map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <select
            {...register('icon')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="icon-select"
          >
            <option value="">None</option>
            {availableIcons.map(icon => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        {/* Feature Flag */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Feature Flag
          </label>
          <select
            {...register('feature_flag')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="feature-flag-select"
          >
            <option value="">None (Always Show)</option>
            {availableFeatureFlags.map(flag => (
              <option key={flag} value={flag}>
                {flag}
              </option>
            ))}
          </select>
        </div>

        {/* Order Index */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Index
          </label>
          <input
            type="number"
            {...register('order_index', { 
              min: { value: 0, message: 'Order index must be 0 or greater' },
              valueAsNumber: true
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            data-testid="order-input"
          />
          {errors.order_index && (
            <p className="mt-1 text-sm text-red-600" data-testid="order-error">
              {errors.order_index.message}
            </p>
          )}
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('is_enabled')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid="enabled-checkbox"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Enabled (visible in navigation)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            data-testid="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            data-testid="save-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuManagementForm;