import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Camera, 
  FileText, 
  Grid3X3, 
  MessageCircle, 
  ShoppingBag, 
  Users, 
  Briefcase,
  TrendingUp,
  Star,
  Settings,
  Home
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DashboardStats } from '../../types';

interface DashboardSidebarProps {
  stats?: DashboardStats;
  className?: string;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: 'new' | 'updated' | null;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  stats,
  className
}) => {
  const location = useLocation();

  const navigationItems: SidebarItem[] = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'My Content',
      href: '/dashboard/content',
      icon: Grid3X3,
      count: stats?.totalContent
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      name: 'Activity',
      href: '/dashboard/activity',
      icon: TrendingUp,
    }
  ];

  const contentSections: SidebarItem[] = [
    {
      name: 'Events',
      href: '/dashboard/content/events',
      icon: Calendar,
      count: stats?.contentByType.events
    },
    {
      name: 'News',
      href: '/dashboard/content/news',
      icon: FileText,
      count: stats?.contentByType.news
    },
    {
      name: 'Resources',
      href: '/dashboard/content/resources',
      icon: Star,
      count: stats?.contentByType.resources
    },
    {
      name: 'Groups',
      href: '/dashboard/content/groups',
      icon: Users,
      count: stats?.contentByType.groups
    },
    {
      name: 'Marketplace',
      href: '/dashboard/content/marketplace',
      icon: ShoppingBag,
      count: stats?.contentByType.marketplace
    },
    {
      name: 'Opportunities',
      href: '/dashboard/content/opportunities',
      icon: Briefcase,
      count: stats?.contentByType.opportunities
    },
    {
      name: 'Galleries',
      href: '/dashboard/content/galleries',
      icon: Camera,
      count: stats?.contentByType.galleries
    },
    {
      name: 'Messages',
      href: '/dashboard/content/messages',
      icon: MessageCircle,
      count: stats?.contentByType.messages
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16 overflow-y-auto",
      className
    )}>
      <div className="px-3 py-4">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(item.href)
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isActive(item.href)
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
              )} />
              <span className="flex-1">{item.name}</span>
              {item.count !== undefined && (
                <span className={cn(
                  "ml-2 inline-block py-0.5 px-2 text-xs rounded-full",
                  isActive(item.href)
                    ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}>
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Content Types Section */}
        <div className="mt-8">
          <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Content Types
          </h3>
          <nav className="mt-2 space-y-1">
            {contentSections.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 flex-shrink-0",
                  isActive(item.href)
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                )} />
                <span className="flex-1">{item.name}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={cn(
                    "ml-2 inline-block py-0.5 px-2 text-xs rounded-full",
                    isActive(item.href)
                      ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}>
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings Link */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/dashboard/settings"
            className={cn(
              "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
              isActive('/dashboard/settings')
                ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Settings className={cn(
              "mr-3 h-5 w-5 flex-shrink-0",
              isActive('/dashboard/settings')
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
            )} />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;