import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
  RotateCcw,
  Settings,
  Globe,
  Users,
  Building2,
  Calendar,
  Newspaper,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Tag,
  Mail,
  Phone,
  MapPin,
  Info,
  HelpCircle,
  FileText,
  Link,
  ExternalLink,
  Home,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Menu
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import Modal from '@/shared/components/ui/Modal/Modal';
import ConfirmationModal from '@/shared/components/ui/Modal/ConfirmationModal';
import { MenuItem, MenuType, MenuTarget, MenuVisibility, MenuItemInput, MenuItemUpdate } from '@/types/menu';
import { menuManagementAdapter } from '@/features/admin/api/menuManagementAdapter';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { useMenuSecurity, useMenuAuditLogs } from '@/features/menu/hooks/useMenuSecurity';
import { createSecureMenuApi, SecureMenuApiContext } from '@/features/menu/api/secureMenuApi';
import { logger } from '@/utils/logger';

// Icon mapping with all available icons
const ICON_COMPONENTS = {
  Home,
  Users,
  Building2,
  Calendar,
  Newspaper,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Tag,
  Mail,
  Phone,
  MapPin,
  Globe,
  Info,
  Settings,
  HelpCircle,
  FileText,
  Link,
  ExternalLink,
  Menu,
  Eye,
  EyeOff
} as const;

// Enhanced icon options with more comprehensive list
const ICON_OPTIONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Users', label: 'Users' },
  { value: 'Building2', label: 'Building' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Newspaper', label: 'News' },
  { value: 'BookOpen', label: 'Resources' },
  { value: 'ShoppingBag', label: 'Shopping' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Mail', label: 'Mail' },
  { value: 'Phone', label: 'Phone' },
  { value: 'MapPin', label: 'Location' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Info', label: 'Info' },
  { value: 'Settings', label: 'Settings' },
  { value: 'HelpCircle', label: 'Help' },
  { value: 'FileText', label: 'Document' },
  { value: 'Link', label: 'Link' },
  { value: 'ExternalLink', label: 'External Link' },
  { value: 'Menu', label: 'Menu' }
] as const;

type IconType = typeof ICON_OPTIONS[number]['value'];

interface TabPanelProps {
  activeTab: MenuType;
  onTabChange: (tab: MenuType) => void;
  menuCounts: Record<MenuType, number>;
}

const TabPanel: React.FC<TabPanelProps> = ({ activeTab, onTabChange, menuCounts }) => {
  const tabs = [
    { id: 'main', label: 'Main Menu', count: menuCounts.main || 0 },
    { id: 'footer', label: 'Footer Menu', count: menuCounts.footer || 0 },
    { id: 'mobile', label: 'Mobile Menu', count: menuCounts.mobile || 0 }
  ] as const;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as MenuType)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            {tab.label}
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Search and Filter interface
interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  visibilityFilter: MenuVisibility | 'all';
  onVisibilityFilterChange: (visibility: MenuVisibility | 'all') => void;
  enabledFilter: boolean | 'all';
  onEnabledFilterChange: (enabled: boolean | 'all') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  visibilityFilter,
  onVisibilityFilterChange,
  enabledFilter,
  onEnabledFilterChange,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Visibility Filter */}
        <div>
          <select
            value={visibilityFilter}
            onChange={(e) => onVisibilityFilterChange(e.target.value as MenuVisibility | 'all')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="authenticated">Authenticated</option>
            <option value="admin">Admin</option>
            <option value="role_based">Role Based</option>
          </select>
        </div>

        {/* Enabled Filter */}
        <div>
          <select
            value={enabledFilter === 'all' ? 'all' : enabledFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              onEnabledFilterChange(value === 'all' ? 'all' : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>

        {/* Refresh Button */}
        <div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

interface EditMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItemInput | MenuItemUpdate) => void;
  item?: MenuItem;
  mode: 'create' | 'edit';
  menuType: MenuType;
  parentOptions: MenuItem[];
}

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
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

  const IconComponent = formData.icon && ICON_COMPONENTS[formData.icon as keyof typeof ICON_COMPONENTS] ? ICON_COMPONENTS[formData.icon as keyof typeof ICON_COMPONENTS] : Link;

  // Check if URL is external
  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
  };

  const handleUrlChange = (url: string) => {
    setFormData({ 
      ...formData, 
      url, 
      is_external: isExternalUrl(url)
    });
  };

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
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <IconComponent className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

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
              onChange={(e) => setFormData({ 
                ...formData, 
                required_roles: e.target.value.split(',').map(role => role.trim()).filter(Boolean) || null 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="admin, superadmin, editor (comma separated)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Users must have one of these roles to see this menu item
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
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

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleEnabled: (item: MenuItem, enabled: boolean) => void;
  onDuplicate: (item: MenuItem) => void;
  isSelected: boolean;
  onSelect: (item: MenuItem, selected: boolean) => void;
  children?: MenuItem[];
  isExpanded?: boolean;
  onToggleExpand?: (item: MenuItem) => void;
  depth: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  index,
  onEdit,
  onDelete,
  onToggleEnabled,
  onDuplicate,
  isSelected,
  onSelect,
  children = [],
  isExpanded = false,
  onToggleExpand,
  depth = 0
}) => {
  const IconComponent = item.icon && ICON_COMPONENTS[item.icon as keyof typeof ICON_COMPONENTS] || Link;
  const hasChildren = children.length > 0;
  
  // Determine visibility badge
  const getVisibilityBadge = () => {
    switch (item.visibility) {
      case 'public':
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">Public</span>;
      case 'authenticated':
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">Auth</span>;
      case 'admin':
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">Admin</span>;
      case 'role_based':
        return <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">Role</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md ${
              snapshot.isDragging ? 'shadow-lg rotate-1' : ''
            } ${!item.is_enabled ? 'opacity-60' : ''} ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              marginLeft: `${depth * 20}px`,
              ...provided.draggableProps.style
            }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3 flex-1">
                {/* Checkbox for bulk selection */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect(item, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                
                {/* Drag handle */}
                <div
                  {...provided.dragHandleProps}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5" />
                </div>
                
                {/* Expand/collapse for hierarchical items */}
                {hasChildren && onToggleExpand && (
                  <button
                    onClick={() => onToggleExpand(item)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
                
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </h3>
                      {getVisibilityBadge()}
                      {item.is_external && (
                        <ExternalLink className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>{item.url}</span>
                      <span>•</span>
                      <span>Order: {item.sort_order}</span>
                      {item.required_roles && (
                        <>
                          <span>•</span>
                          <span>Roles: {item.required_roles.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full ${
                  item.is_enabled ? 'bg-green-400' : 'bg-gray-300'
                }`} title={item.is_enabled ? 'Enabled' : 'Disabled'} />
                
                {/* Enable/Disable Toggle */}
                <Switch
                  checked={item.is_enabled}
                  onCheckedChange={(enabled) => onToggleEnabled(item, enabled)}
                  className="mr-2"
                />
                
                {/* Action Buttons */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDuplicate(item)}
                  className="p-2"
                  title="Duplicate item"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  className="p-2"
                  title="Edit item"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(item)}
                  className="p-2"
                  title="Delete item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
      
      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-2 space-y-2">
          {children.map((child, childIndex) => (
            <MenuItemCard
              key={child.id}
              item={child}
              index={childIndex}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleEnabled={onToggleEnabled}
              onDuplicate={onDuplicate}
              isSelected={isSelected}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </>
  );
};

interface MenuPreviewProps {
  items: MenuItem[];
  type: MenuType;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ items, type }) => {
  // Build hierarchical structure for preview
  const buildHierarchy = (items: MenuItem[]) => {
    const itemMap = new Map<string, MenuItem & { children: MenuItem[] }>();
    const rootItems: (MenuItem & { children: MenuItem[] })[] = [];

    // First pass: create all items with children array
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    return rootItems.sort((a, b) => a.sort_order - b.sort_order);
  };

  const enabledItems = items.filter(item => item.is_enabled);
  const hierarchicalItems = buildHierarchy(enabledItems);
  
  const renderMenuItem = (item: MenuItem & { children: MenuItem[] }, depth = 0) => {
    const IconComponent = item.icon && ICON_COMPONENTS[item.icon as keyof typeof ICON_COMPONENTS] || Link;
    return (
      <div key={item.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center space-x-2 py-1">
          <IconComponent className="h-4 w-4 text-current" />
          <span className="text-sm">{item.title}</span>
          {item.target === '_blank' && (
            <ExternalLink className="h-3 w-3 text-current opacity-70" />
          )}
          {item.is_external && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1 rounded">EXT</span>
          )}
        </div>
        {item.children.map(child => renderMenuItem(child, depth + 1))}
      </div>
    );
  };
  
  if (type === 'main') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Menu className="h-5 w-5 mr-2" />
            Main Menu Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg text-white">
            {hierarchicalItems.length > 0 ? (
              <div className="space-y-1">
                {hierarchicalItems.map(item => renderMenuItem(item))}
              </div>
            ) : (
              <p className="text-white/70 italic">No enabled menu items</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'footer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Footer Menu Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-800 p-4 rounded-lg text-white">
            {hierarchicalItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hierarchicalItems.map(item => (
                  <div key={item.id} className="space-y-1">
                    {renderMenuItem(item)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No enabled menu items</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile menu preview
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Menu className="h-5 w-5 mr-2" />
          Mobile Menu Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 p-4 rounded-lg text-white max-w-sm mx-auto">
          {hierarchicalItems.length > 0 ? (
            <div className="space-y-2">
              {hierarchicalItems.map(item => renderMenuItem(item))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No enabled menu items</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Bulk operations toolbar
interface BulkOperationsProps {
  selectedItems: MenuItem[];
  onBulkEnable: () => void;
  onBulkDisable: () => void;
  onBulkDelete: () => void;
  onDeselectAll: () => void;
  isLoading: boolean;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
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

const AdminMenuManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const menuSecurity = useMenuSecurity();
  
  // Create secure API context
  const secureApiContext: SecureMenuApiContext = {
    userId: user?.id || '',
    userEmail: user?.email || '',
    userRoles: userRoles,
    sessionId: sessionStorage.getItem('session_id') || undefined,
    ipAddress: localStorage.getItem('client_ip') || undefined
  };
  
  const secureMenuApi = createSecureMenuApi(secureApiContext);

  // State
  const [activeTab, setActiveTab] = useState<MenuType>('main');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | undefined>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<MenuVisibility | 'all'>('all');
  const [enabledFilter, setEnabledFilter] = useState<boolean | 'all'>('all');

  // Enhanced permission check using menu security
  const hasAdminAccess = menuSecurity.canReadMenus && (userRoles?.includes('superadmin') || userRoles?.includes('admin') || userRoles?.includes('menu_manager'));

  // Fetch menu items with security
  const { data: menuResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['secure-menu-items'],
    queryFn: async () => {
      const result = await secureMenuApi.getMenuItems();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch menu items');
      }
      return result.data || [];
    },
    enabled: hasAdminAccess
  });
  
  const allMenuItems = menuResponse || [];

  // Filter items by current tab and search/filter criteria
  const getCurrentTabItems = () => {
    let items = allMenuItems.filter(item => item.menu_type === activeTab);
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(search) ||
        item.url.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
      );
    }
    
    if (visibilityFilter !== 'all') {
      items = items.filter(item => item.visibility === visibilityFilter);
    }
    
    if (enabledFilter !== 'all') {
      items = items.filter(item => item.is_enabled === enabledFilter);
    }
    
    return items.sort((a, b) => a.sort_order - b.sort_order);
  };

  const currentItems = getCurrentTabItems();
  
  // Get parent options for dropdown (exclude current item and its children when editing)
  const getParentOptions = () => {
    return allMenuItems
      .filter(item => 
        item.menu_type === activeTab && 
        (!editingItem || (item.id !== editingItem.id && item.parent_id !== editingItem.id))
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  // Get menu counts for tabs
  const getMenuCounts = (): Record<MenuType, number> => {
    const counts = { main: 0, footer: 0, mobile: 0, admin: 0 };
    allMenuItems.forEach(item => {
      counts[item.menu_type] = (counts[item.menu_type] || 0) + 1;
    });
    return counts;
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: MenuItemInput) => {
      // Validate permissions before creation
      const validation = menuSecurity.validateMenuItem(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const result = await secureMenuApi.createMenuItem(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create menu item');
      }
      return result.data!;
    },
    onSuccess: (newItem) => {
      toast.success('Menu item created successfully');
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
      // Log the action
      menuSecurity.logMenuAction('create', 'menu_item', {
        menuItemId: newItem.id,
        newValues: newItem
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create menu item');
      logger.error('Menu item creation failed', 'MENU_UI', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: MenuItemUpdate) => {
      // Validate permissions before update
      const validation = menuSecurity.validateMenuItem(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const result = await secureMenuApi.updateMenuItem(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update menu item');
      }
      return result.data!;
    },
    onSuccess: (updatedItem) => {
      toast.success('Menu item updated successfully');
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update menu item');
      logger.error('Menu item update failed', 'MENU_UI', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await secureMenuApi.deleteMenuItem(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete menu item');
      }
    },
    onSuccess: () => {
      toast.success('Menu item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete menu item');
      logger.error('Menu item deletion failed', 'MENU_UI', error);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const result = await secureMenuApi.toggleMenuItem(id, 'is_enabled');
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle menu item');
      }
      return result.data!;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['secure-menu-items'] });
      toast.success(`Menu item ${updatedItem.is_enabled ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update menu item status');
      logger.error('Menu item toggle failed', 'MENU_UI', error);
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (updates: Array<{ id: string; order_index: number; parent_id?: string | null }>) => 
      menuManagementAdapter.reorderMenuItems(updates),
    onSuccess: () => {
      toast.success('Menu items reordered successfully');
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reorder menu items');
    }
  });

  // Event handlers
  const handleDragEnd = useCallback((result: DropResult) => {
    // Validate the drag result
    if (!result.destination) return;
    if (!result.draggableId) return;
    if (result.source.index === result.destination.index) return;
    
    // Ensure we're working with the right droppable
    const expectedDroppableId = `${activeTab}-menu`;
    if (result.source.droppableId !== expectedDroppableId || 
        result.destination.droppableId !== expectedDroppableId) {
      console.warn('Droppable ID mismatch', {
        expected: expectedDroppableId,
        source: result.source.droppableId,
        destination: result.destination.droppableId
      });
      return;
    }

    const items = Array.from(currentItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Create reorder updates
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index * 100, // Use increments of 100 for easier reordering
      parent_id: item.parent_id
    }));

    reorderMutation.mutate(updates);
  }, [currentItems, reorderMutation, activeTab]);

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
    toast.success(`Menu item ${enabled ? 'enabled' : 'disabled'}`);
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

  const handleSelectItem = (item: MenuItem, selected: boolean) => {
    setSelectedItems(prev => {
      if (selected) {
        return [...prev, item.id];
      } else {
        return prev.filter(id => id !== item.id);
      }
    });
  };

  const handleToggleExpand = (item: MenuItem) => {
    setExpandedItems(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
  };

  // Bulk operations
  const handleBulkEnable = async () => {
    const itemsToEnable = selectedItems
      .map(id => allMenuItems.find(item => item.id === id))
      .filter((item): item is MenuItem => item !== undefined && !item.is_enabled);
    
    // Validate bulk operation
    const validation = await menuSecurity.validateBulkOperation('toggle', itemsToEnable);
    if (!validation.allowed) {
      toast.error(`Bulk enable failed: ${validation.errors.join(', ')}`);
      return;
    }
    
    itemsToEnable.forEach(item => {
      toggleMutation.mutate({ id: item.id, isEnabled: true });
    });
    setSelectedItems([]);
  };

  const handleBulkDisable = async () => {
    const itemsToDisable = selectedItems
      .map(id => allMenuItems.find(item => item.id === id))
      .filter((item): item is MenuItem => item !== undefined && item.is_enabled);
    
    // Validate bulk operation
    const validation = await menuSecurity.validateBulkOperation('toggle', itemsToDisable);
    if (!validation.allowed) {
      toast.error(`Bulk disable failed: ${validation.errors.join(', ')}`);
      return;
    }
    
    itemsToDisable.forEach(item => {
      toggleMutation.mutate({ id: item.id, isEnabled: false });
    });
    setSelectedItems([]);
  };

  const handleBulkDelete = async () => {
    const itemsToDelete = selectedItems
      .map(id => allMenuItems.find(item => item.id === id))
      .filter((item): item is MenuItem => item !== undefined);
    
    // Validate bulk operation
    const validation = await menuSecurity.validateBulkOperation('delete', itemsToDelete);
    if (!validation.allowed) {
      toast.error(`Bulk delete failed: ${validation.errors.join(', ')}`);
      return;
    }
    
    if (confirm(`Delete ${selectedItems.length} menu items? This action cannot be undone.`)) {
      selectedItems.forEach(id => {
        deleteMutation.mutate(id);
      });
      setSelectedItems([]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  // Get selected menu items for bulk operations
  const selectedMenuItems = allMenuItems.filter(item => selectedItems.includes(item.id));

  // Build hierarchical structure for display
  const buildHierarchy = (items: MenuItem[]) => {
    const itemMap = new Map<string, MenuItem & { children: MenuItem[] }>();
    const rootItems: (MenuItem & { children: MenuItem[] })[] = [];

    // First pass: create all items with children array
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    return rootItems.sort((a, b) => a.sort_order - b.sort_order);
  };

  const hierarchicalItems = buildHierarchy(currentItems);

  // Enhanced permission check with detailed messaging
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Menu</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Menu Management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your site's navigation menus. Drag and drop to reorder items, create hierarchies, and control visibility.
        </p>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
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
      <BulkOperations
        selectedItems={selectedMenuItems}
        onBulkEnable={handleBulkEnable}
        onBulkDisable={handleBulkDisable}
        onBulkDelete={handleBulkDelete}
        onDeselectAll={handleDeselectAll}
        isLoading={isLoading}
      />

      {/* Tab Navigation */}
      <TabPanel 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        menuCounts={getMenuCounts()}
      />

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
            <Droppable droppableId={`${activeTab}-menu`} key={activeTab}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-[100px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading menu items...</span>
                    </div>
                  ) : (
                    currentItems.map((item, index) => (
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
                        children={allMenuItems.filter(child => child.parent_id === item.id)}
                        isExpanded={expandedItems.includes(item.id)}
                        onToggleExpand={handleToggleExpand}
                        depth={0}
                      />
                    ))
                  )}
                  {provided.placeholder}
                  {!isLoading && currentItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No menu items found.</p>
                      <p className="text-sm">Try adjusting your filters or click "Add Item" to get started.</p>
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
              <MenuPreview items={currentItems} type={activeTab} />
            </div>
            
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {currentItems.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentItems.filter(item => item.is_enabled).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Enabled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentItems.filter(item => item.parent_id === null).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Top Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentItems.filter(item => item.parent_id !== null).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sub Items</div>
                  </div>
                </div>
                
                {/* Visibility breakdown */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Visibility</h5>
                  <div className="space-y-1">
                    {['public', 'authenticated', 'admin', 'role_based'].map(visibility => {
                      const count = currentItems.filter(item => item.visibility === visibility).length;
                      return (
                        <div key={visibility} className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600 dark:text-gray-400">{visibility.replace('_', ' ')}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // Export menu structure
                      const dataStr = JSON.stringify(currentItems, null, 2);
                      const dataBlob = new Blob([dataStr], {type:'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${activeTab}-menu-${new Date().toISOString().split('T')[0]}.json`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export {activeTab} Menu
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={refetch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMenuItemModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        item={editingItem}
        mode={editMode}
        menuType={activeTab}
        parentOptions={getParentOptions()}
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
            <p>Are you sure you want to delete <strong>"{itemToDelete?.title}"</strong>?</p>
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

export default AdminMenuManagementPage;