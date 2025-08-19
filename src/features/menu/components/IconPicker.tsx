import React, { useState, useMemo } from 'react';
import {
  Home,
  Users,
  Calendar,
  Building,
  Briefcase,
  Book,
  Newspaper,
  Camera,
  Map,
  Info,
  Settings,
  HelpCircle,
  Mail,
  Phone,
  Globe,
  Star,
  Heart,
  Shield,
  Trophy,
  Target,
  Zap,
  Flame,
  Gift,
  Music,
  Video,
  Image,
  FileText,
  Download,
  Upload,
  Share,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Menu,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  User,
  UserPlus,
  UserMinus,
  MessageCircle,
  MessageSquare,
  Bell,
  BellOff,
  Clock,
  Archive,
  Bookmark,
  Flag,
  Tag,
  Folder,
  FolderOpen,
  File,
  Link,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Loader,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Icon categories for better organization
const ICON_CATEGORIES = {
  navigation: {
    label: 'Navigation',
    icons: [
      { name: 'home', component: Home, keywords: ['house', 'main', 'dashboard'] },
      { name: 'menu', component: Menu, keywords: ['hamburger', 'nav', 'navigation'] },
      { name: 'chevron-right', component: ChevronRight, keywords: ['arrow', 'next', 'forward'] },
      { name: 'chevron-left', component: ChevronLeft, keywords: ['arrow', 'back', 'previous'] },
      { name: 'chevron-up', component: ChevronUp, keywords: ['arrow', 'up', 'collapse'] },
      { name: 'chevron-down', component: ChevronDown, keywords: ['arrow', 'down', 'expand'] },
      { name: 'arrow-right', component: ArrowRight, keywords: ['next', 'continue'] },
      { name: 'arrow-left', component: ArrowLeft, keywords: ['back', 'return'] },
      { name: 'external-link', component: ExternalLink, keywords: ['external', 'new window'] },
      { name: 'link', component: Link, keywords: ['url', 'href', 'connection'] },
    ],
  },
  content: {
    label: 'Content & Media',
    icons: [
      { name: 'newspaper', component: Newspaper, keywords: ['news', 'blog', 'article'] },
      { name: 'book', component: Book, keywords: ['resources', 'library', 'education'] },
      { name: 'camera', component: Camera, keywords: ['photo', 'gallery', 'image'] },
      { name: 'image', component: Image, keywords: ['picture', 'photo', 'media'] },
      { name: 'video', component: Video, keywords: ['movie', 'clip', 'media'] },
      { name: 'music', component: Music, keywords: ['audio', 'sound', 'song'] },
      { name: 'file-text', component: FileText, keywords: ['document', 'text', 'page'] },
      { name: 'file', component: File, keywords: ['document', 'attachment'] },
      { name: 'folder', component: Folder, keywords: ['directory', 'collection'] },
      { name: 'archive', component: Archive, keywords: ['storage', 'backup'] },
    ],
  },
  business: {
    label: 'Business & Organizations',
    icons: [
      { name: 'building', component: Building, keywords: ['company', 'office', 'corporate'] },
      { name: 'briefcase', component: Briefcase, keywords: ['work', 'job', 'career', 'opportunities'] },
      { name: 'users', component: Users, keywords: ['team', 'group', 'community', 'directory'] },
      { name: 'user', component: User, keywords: ['person', 'profile', 'account'] },
      { name: 'calendar', component: Calendar, keywords: ['events', 'schedule', 'date'] },
      { name: 'trophy', component: Trophy, keywords: ['achievement', 'award', 'success'] },
      { name: 'target', component: Target, keywords: ['goal', 'objective', 'aim'] },
      { name: 'bar-chart-3', component: BarChart3, keywords: ['analytics', 'data', 'metrics'] },
      { name: 'trending-up', component: TrendingUp, keywords: ['growth', 'increase', 'performance'] },
      { name: 'activity', component: Activity, keywords: ['performance', 'metrics', 'pulse'] },
    ],
  },
  communication: {
    label: 'Communication',
    icons: [
      { name: 'mail', component: Mail, keywords: ['email', 'contact', 'message'] },
      { name: 'phone', component: Phone, keywords: ['call', 'contact', 'telephone'] },
      { name: 'message-circle', component: MessageCircle, keywords: ['chat', 'talk', 'conversation'] },
      { name: 'message-square', component: MessageSquare, keywords: ['chat', 'comment', 'discussion'] },
      { name: 'bell', component: Bell, keywords: ['notification', 'alert', 'reminder'] },
      { name: 'share', component: Share, keywords: ['social', 'distribute', 'spread'] },
      { name: 'globe', component: Globe, keywords: ['world', 'international', 'web'] },
      { name: 'user-plus', component: UserPlus, keywords: ['invite', 'add member', 'join'] },
      { name: 'heart', component: Heart, keywords: ['like', 'favorite', 'love'] },
      { name: 'star', component: Star, keywords: ['favorite', 'rating', 'featured'] },
    ],
  },
  interface: {
    label: 'Interface & Actions',
    icons: [
      { name: 'settings', component: Settings, keywords: ['config', 'preferences', 'admin'] },
      { name: 'help-circle', component: HelpCircle, keywords: ['help', 'support', 'faq'] },
      { name: 'info', component: Info, keywords: ['information', 'about', 'details'] },
      { name: 'search', component: Search, keywords: ['find', 'lookup', 'query'] },
      { name: 'filter', component: Filter, keywords: ['sort', 'refine', 'organize'] },
      { name: 'edit', component: Edit, keywords: ['modify', 'change', 'update'] },
      { name: 'plus', component: Plus, keywords: ['add', 'create', 'new'] },
      { name: 'check', component: Check, keywords: ['confirm', 'approve', 'done'] },
      { name: 'x', component: X, keywords: ['close', 'cancel', 'remove'] },
      { name: 'eye', component: Eye, keywords: ['view', 'show', 'visible'] },
      { name: 'eye-off', component: EyeOff, keywords: ['hide', 'invisible', 'private'] },
      { name: 'lock', component: Lock, keywords: ['secure', 'private', 'protected'] },
      { name: 'shield', component: Shield, keywords: ['security', 'protection', 'safe'] },
      { name: 'refresh-cw', component: RefreshCw, keywords: ['reload', 'update', 'sync'] },
    ],
  },
};

// Flatten all icons for searching
const ALL_ICONS = Object.values(ICON_CATEGORIES).flatMap(category => 
  category.icons.map(icon => ({ ...icon, category: category.label }))
);

interface IconPickerProps {
  value?: string | null;
  onChange: (iconName: string | null) => void;
  className?: string;
  placeholder?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  className,
  placeholder = "Select an icon...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter icons based on search term and category
  const filteredIcons = useMemo(() => {
    let icons = ALL_ICONS;

    // Filter by category
    if (selectedCategory !== 'all') {
      icons = icons.filter(icon => icon.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      icons = icons.filter(icon =>
        icon.name.toLowerCase().includes(lowercaseSearch) ||
        icon.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseSearch))
      );
    }

    return icons;
  }, [searchTerm, selectedCategory]);

  // Get the selected icon component
  const selectedIcon = value ? ALL_ICONS.find(icon => icon.name === value) : null;

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center">
          {selectedIcon ? (
            <>
              <selectedIcon.component className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-gray-900">{selectedIcon.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search and Controls */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex space-x-2 mb-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="px-2 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(ICON_CATEGORIES).map(([key, category]) => (
                <option key={key} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icon Grid */}
          <div className="max-h-64 overflow-y-auto">
            {filteredIcons.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No icons found matching your search
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1 p-2">
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.component;
                  const isSelected = value === icon.name;
                  
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleIconSelect(icon.name)}
                      className={cn(
                        "p-2 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors",
                        isSelected && "bg-blue-100 text-blue-600 ring-2 ring-blue-500"
                      )}
                      title={`${icon.name} (${icon.category})`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with icon count */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
          </div>
        </div>
      )}
    </div>
  );
};

// Preview component for showing icon in different contexts
interface IconPreviewProps {
  iconName?: string | null;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const IconPreview: React.FC<IconPreviewProps> = ({
  iconName,
  title,
  size = 'md',
  showLabel = false,
  className,
}) => {
  const icon = iconName ? ALL_ICONS.find(i => i.name === iconName) : null;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (!icon) {
    return (
      <div className={cn(
        "flex items-center text-gray-400",
        className
      )}>
        <div className={cn("border border-dashed border-gray-300 rounded", sizeClasses[size])} />
        {showLabel && title && <span className="ml-2 text-sm">{title}</span>}
      </div>
    );
  }

  const IconComponent = icon.component;

  return (
    <div className={cn("flex items-center", className)}>
      <IconComponent className={cn("text-gray-600", sizeClasses[size])} />
      {showLabel && title && <span className="ml-2 text-sm">{title}</span>}
    </div>
  );
};

export default IconPicker;