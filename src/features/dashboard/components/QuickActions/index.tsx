import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Camera, 
  Calendar, 
  Newspaper, 
  BookOpen, 
  Users, 
  ShoppingBag, 
  Briefcase 
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';

const QUICK_ACTIONS = [
  {
    id: 'gallery',
    label: 'Photo Gallery',
    icon: Camera,
    href: '/galleries/create',
    description: 'Create a new photo gallery',
    category: 'content'
  },
  {
    id: 'event',
    label: 'Event',
    icon: Calendar,
    href: '/events/create',
    description: 'Organize a new event',
    category: 'content'
  },
  {
    id: 'news',
    label: 'News Article',
    icon: Newspaper,
    href: '/news/create',
    description: 'Share community news',
    category: 'content'
  },
  {
    id: 'resource',
    label: 'Resource',
    icon: BookOpen,
    href: '/resources/create',
    description: 'Share helpful resources',
    category: 'content'
  },
  {
    id: 'group',
    label: 'Group',
    icon: Users,
    href: '/groups/create',
    description: 'Start a new group',
    category: 'social'
  },
  {
    id: 'marketplace',
    label: 'Listing',
    icon: ShoppingBag,
    href: '/marketplace/create',
    description: 'Post a marketplace item',
    category: 'content'
  },
  {
    id: 'opportunity',
    label: 'Opportunity',
    icon: Briefcase,
    href: '/opportunities/create',
    description: 'Share job opportunities',
    category: 'content'
  }
];

interface QuickActionsProps {
  layout?: 'grid' | 'list' | 'horizontal';
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  layout = 'grid',
  className = ''
}) => {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Quick Actions
        </h3>
        <Plus className="h-5 w-5 text-slate-400" />
      </div>
      
      <div className={`
        ${layout === 'grid' ? 'grid grid-cols-2 gap-3' : ''}
        ${layout === 'list' ? 'space-y-2' : ''}
        ${layout === 'horizontal' ? 'flex flex-wrap gap-2' : ''}
      `}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          
          if (layout === 'list') {
            return (
              <Link
                key={action.id}
                to={action.href}
                className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                <div className="flex-shrink-0 p-2 bg-orange-500 rounded-lg text-white group-hover:bg-orange-600 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                    {action.label}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          }
          
          if (layout === 'horizontal') {
            return (
              <Link
                key={action.id}
                to={action.href}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <Icon className="h-4 w-4 mr-2 text-orange-500" />
                {action.label}
              </Link>
            );
          }
          
          // Grid layout (default)
          return (
            <Link
              key={action.id}
              to={action.href}
              className="flex flex-col items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group text-center"
            >
              <div className="p-2 bg-orange-500 rounded-lg text-white group-hover:bg-orange-600 transition-colors mb-2">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-medium text-slate-900 dark:text-white">
                {action.label}
              </h4>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;