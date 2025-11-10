/**
 * MenuItemEditor Component
 * Modal form for creating and editing menu items
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '@/shared/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { MenuItem, MenuType, MenuTarget, MenuVisibility, MenuItemInput, MenuItemUpdate } from '@/types/menu';
import { ICON_COMPONENTS, ICON_OPTIONS } from '../constants';
import { isExternalUrl } from '../utils/menuHelpers';

interface MenuItemEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItemInput | MenuItemUpdate) => void;
  item?: MenuItem;
  mode: 'create' | 'edit';
  menuType: MenuType;
  parentOptions: MenuItem[];
}

export const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
  menuType,
  parentOptions
}) => {
  const [formData, setFormData] = useState<Partial<MenuItemInput & { id?: string }>>({
    title: '',
    url: '',
    description: '',
    menu_type: menuType,
    parent_id: null,
    sort_order: 0,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or item changes
  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        id: item.id,
        title: item.title,
        url: item.url,
        description: item.description || '',
        menu_type: item.menu_type,
        parent_id: item.parent_id,
        sort_order: item.sort_order,
        is_enabled: item.is_enabled,
        target: item.target,
        icon: item.icon,
        css_classes: item.css_classes,
        visibility: item.visibility,
        required_roles: item.required_roles,
        is_external: item.is_external
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        menu_type: menuType,
        parent_id: null,
        sort_order: 0,
        is_enabled: true,
        target: '_self',
        icon: null,
        css_classes: null,
        visibility: 'public',
        required_roles: null,
        is_external: false
      });
    }
  }, [item, mode, isOpen, menuType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.url?.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const newItem: MenuItemInput = {
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description?.trim() || undefined,
          menu_type: formData.menu_type!,
          parent_id: formData.parent_id,
          sort_order: formData.sort_order || 0,
          is_enabled: formData.is_enabled ?? true,
          target: formData.target || '_self',
          icon: formData.icon || null,
          css_classes: formData.css_classes || null,
          visibility: formData.visibility || 'public',
          required_roles: formData.required_roles || null,
          is_external: formData.is_external || false
        };
        await onSave(newItem);
      } else {
        const updateItem: MenuItemUpdate = {
          id: formData.id!,
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description?.trim() || undefined,
          parent_id: formData.parent_id,
          sort_order: formData.sort_order,
          is_enabled: formData.is_enabled,
          target: formData.target,
          icon: formData.icon,
          css_classes: formData.css_classes,
          visibility: formData.visibility,
          required_roles: formData.required_roles,
          is_external: formData.is_external
        };
        await onSave(updateItem);
      }
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData({
      ...formData,
      url,
      is_external: isExternalUrl(url)
    });
  };

  const IconComponent = formData.icon && ICON_COMPONENTS[formData.icon as keyof typeof ICON_COMPONENTS]
    ? ICON_COMPONENTS[formData.icon as keyof typeof ICON_COMPONENTS]
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isSubmitting ? onClose : () => {}}
      title={mode === 'create' ? 'Add New Menu Item' : 'Edit Menu Item'}
      size="xl"
      closeOnOutsideClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Menu item title"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Parent Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parent Item
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isSubmitting}
            >
              <option value="">No Parent (Top Level)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="text"
              value={formData.url || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="/page or https://external-site.com"
              required
              disabled={isSubmitting}
            />
            {formData.is_external && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                <ExternalLink className="h-3 w-3 inline mr-1" />
                External link detected
              </p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="relative">
              <select
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value || null })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isSubmitting}
              >
                <option value="">No Icon</option>
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {IconComponent && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <IconComponent className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Link Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link Target
            </label>
            <select
              value={formData.target || '_self'}
              onChange={(e) => setFormData({ ...formData, target: e.target.value as MenuTarget })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isSubmitting}
            >
              <option value="_self">Same Window</option>
              <option value="_blank">New Window</option>
              <option value="_parent">Parent Frame</option>
              <option value="_top">Top Frame</option>
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility
            </label>
            <select
              value={formData.visibility || 'public'}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as MenuVisibility })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isSubmitting}
            >
              <option value="public">Public</option>
              <option value="authenticated">Authenticated Users</option>
              <option value="admin">Admin Only</option>
              <option value="role_based">Role Based</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order || 0}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="0"
              disabled={isSubmitting}
            />
          </div>

          {/* CSS Classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CSS Classes
            </label>
            <input
              type="text"
              value={formData.css_classes || ''}
              onChange={(e) => setFormData({ ...formData, css_classes: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Custom CSS classes"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu Item Status</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enable or disable this menu item</p>
          </div>
          <Switch
            checked={formData.is_enabled ?? true}
            onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Optional description for admin reference"
            disabled={isSubmitting}
          />
        </div>

        {/* Role-based access control */}
        {formData.visibility === 'role_based' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Roles
            </label>
            <input
              type="text"
              value={formData.required_roles?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  required_roles: e.target.value.split(',').map(role => role.trim()).filter(Boolean) || null
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="admin, superadmin, editor (comma separated)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Users must have one of these roles to see this menu item
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              mode === 'create' ? 'Create Menu Item' : 'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
