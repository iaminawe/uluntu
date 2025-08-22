import React from 'react';
import { Bell, Menu, Search, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { NotificationDropdown } from '../NotificationDropdown';
import { QuickSearchDropdown } from '../QuickSearchDropdown';
import type { DashboardUser } from '../../types';

interface DashboardHeaderProps {
  user?: DashboardUser;
  onMobileMenuToggle?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onMobileMenuToggle
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center">
              <Link 
                to="/dashboard" 
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search your content..."
                  className="pl-10 block w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 150)}
                />
              </div>
              
              {showSearch && searchQuery && (
                <QuickSearchDropdown 
                  query={searchQuery} 
                  onSelect={() => setShowSearch(false)}
                />
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            
            <Link to="/dashboard/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            {/* User avatar */}
            {user?.member_profile?.image ? (
              <img
                src={user.member_profile.image}
                alt={user.member_profile.name || 'User avatar'}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.member_profile?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;