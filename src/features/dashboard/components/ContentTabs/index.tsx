import React from 'react';
import { 
  Calendar, 
  Camera, 
  FileText, 
  Grid3X3, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  Briefcase,
  Star,
  Edit
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ContentType } from '../../types';

interface ContentTabsProps {
  activeTab: ContentType | 'all';
  onTabChange: (tab: ContentType | 'all') => void;
  stats?: {
    totalByType: Record<ContentType, number>;
    totalByStatus: Record<string, number>;
  };
}

interface TabConfig {
  id: ContentType | 'all';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const tabConfigs: TabConfig[] = [
  {
    id: 'all',
    label: 'All Content',
    icon: Grid3X3,
    color: 'text-gray-600 border-gray-300'
  },
  {
    id: 'event',
    label: 'Events',
    icon: Calendar,
    color: 'text-blue-600 border-blue-300'
  },
  {
    id: 'news',
    label: 'News',
    icon: FileText,
    color: 'text-green-600 border-green-300'
  },
  {
    id: 'resource',
    label: 'Resources',
    icon: Star,
    color: 'text-yellow-600 border-yellow-300'
  },
  {
    id: 'group',
    label: 'Groups',
    icon: Users,
    color: 'text-purple-600 border-purple-300'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    color: 'text-orange-600 border-orange-300'
  },
  {
    id: 'opportunity',
    label: 'Opportunities',
    icon: Briefcase,
    color: 'text-red-600 border-red-300'
  },
  {
    id: 'gallery',
    label: 'Galleries',
    icon: Camera,
    color: 'text-pink-600 border-pink-300'
  },
  {
    id: 'message',
    label: 'Messages',
    icon: MessageCircle,
    color: 'text-indigo-600 border-indigo-300'
  }
];

export const ContentTabs: React.FC<ContentTabsProps> = ({
  activeTab,
  onTabChange,
  stats
}) => {
  const getTabCount = (tabId: ContentType | 'all'): number => {
    if (tabId === 'all') {
      return stats ? Object.values(stats.totalByType).reduce((sum, count) => sum + count, 0) : 0;
    }
    return stats?.totalByType[tabId] || 0;
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Content tabs">
        {tabConfigs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-center text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 focus:z-10 whitespace-nowrap",
                isActive
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                )} />
                <span className="truncate">{tab.label}</span>
                {count > 0 && (
                  <span className={cn(
                    "ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ContentTabs;