import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  Calendar,
  FileText,
  BookOpen,
  Users,
  ShoppingBag,
  Briefcase,
  Camera,
  ArrowRight
} from 'lucide-react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useEnabledFeatures } from '@/hooks/useSettings';
import type { FeatureKey } from '@/types/settings';
import { cn } from '@/utils/cn';

interface CreateOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  color: string;
  permissions?: string[];
  feature?: FeatureKey; // Optional feature requirement
}

const createOptions: CreateOption[] = [
  {
    id: 'event',
    label: 'Create Event',
    icon: Calendar,
    href: '/events/create',
    description: 'Schedule meetings, workshops, and gatherings',
    color: 'blue',
    feature: 'events_system',
  },
  {
    id: 'news',
    label: 'Write Article',
    icon: FileText,
    href: '/news/create',
    description: 'Share news and announcements',
    color: 'green',
    feature: 'news_blog',
  },
  {
    id: 'resource',
    label: 'Add Resource',
    icon: BookOpen,
    href: '/resources/create',
    description: 'Upload documents and helpful materials',
    color: 'purple',
    feature: 'resources_library',
  },
  {
    id: 'group',
    label: 'Create Group',
    icon: Users,
    href: '/groups/create',
    description: 'Start a new community group',
    color: 'orange',
    feature: 'groups_communities',
  },
  {
    id: 'marketplace',
    label: 'List Item',
    icon: ShoppingBag,
    href: '/marketplace/create',
    description: 'Sell or trade items',
    color: 'indigo',
    feature: 'marketplace',
  },
  {
    id: 'opportunity',
    label: 'Post Opportunity',
    icon: Briefcase,
    href: '/opportunities/create',
    description: 'Share job openings and collaborations',
    color: 'red',
    feature: 'opportunities_board',
  },
  {
    id: 'gallery',
    label: 'Create Gallery',
    icon: Camera,
    href: '/galleries/create',
    description: 'Upload and organize photos',
    color: 'pink',
    feature: 'photo_galleries',
  },
];

interface CreateContentDropdownProps {
  className?: string;
}

export const CreateContentDropdown: React.FC<CreateContentDropdownProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSession();
  const { isFeatureEnabled } = useEnabledFeatures();

  const availableOptions = useMemo(() => {
    return createOptions.filter(option => {
      // Check feature toggle first
      if (option.feature && !isFeatureEnabled(option.feature)) {
        return false;
      }

      // Then check permissions
      if (!option.permissions) return true;
      return option.permissions.some(permission => user?.permissions?.includes(permission));
    });
  }, [isFeatureEnabled, user?.permissions]);

  // Don't render if no options are available
  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
          className
        )}
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Content
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
            <div className="p-2 max-h-96 overflow-y-auto">
              <div className="grid gap-1">
                {availableOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Link
                      key={option.id}
                      to={option.href}
                      className={cn(
                        "flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className={cn(
                        "p-2 rounded-md mr-3 flex-shrink-0",
                        `bg-${option.color}-100 dark:bg-${option.color}-900/20`
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          `text-${option.color}-600 dark:text-${option.color}-400`
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateContentDropdown;