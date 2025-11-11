import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, UserPlus, LogIn, Edit, Users, BookOpen, ShoppingBag, ChevronRight, Camera, MessageCircle, Grid3X3 } from 'lucide-react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { useUserGroups, useUserResources, useUserMarketplaceItems } from '@/shared/hooks/useUserContent';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { UnreadBadge } from '@/features/messaging/components/UnreadBadge';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';
import { getGroupUrl, getResourceUrl, getMarketplaceListingUrl } from '@/utils/contentUrlUtils';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const isAdmin = authState.roles.isAdmin;
  const navigate = useNavigate();

  // Check if messaging and marketplace features are enabled
  const { isFeatureEnabled } = useEnabledFeatures();
  const isMessagingEnabled = isFeatureEnabled('user_messaging');
  const isMarketplaceEnabled = isFeatureEnabled('marketplace');
  
  // Debug logging for admin access (disabled)
  /*
  console.log('🔍 UserMenu Debug:', {
    user: user?.email,
    isAdmin,
    userRoles,
    hasUser: !!user,
    shouldShowAdmin: !!user && isAdmin
  });
  */
  
  // Get the member profile for the current user
  const { data: member } = useMemberByUserId(user?.id);
  
  // Get user's content
  const { groups, isLoading: groupsLoading } = useUserGroups();
  const { resources, isLoading: resourcesLoading } = useUserResources();
  const { items: marketplaceItems, isLoading: marketplaceLoading } = useUserMarketplaceItems();

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Only add event listener if menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-orange-100 transition-colors p-2 -m-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user ? (
          <div className="flex items-center space-x-2">
            {member?.image ? (
              <img 
                src={member.image} 
                alt={member.name || 'User avatar'} 
                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            )}
            {member?.name && (
              <span className="text-white text-sm font-medium hidden sm:inline-block truncate max-w-[120px]">
                {member.name}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <span className="mr-2">Account</span>
            <User className="h-5 w-5" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-200 dark:border-slate-700 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                {member?.name && (
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {member.name}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
              
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Dashboard
                </div>
              </Link>
              
              {/* Profile */}
              {member && (
                <Link
                  to={getMemberProfileUrl(member)}
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </div>
                </Link>
              )}
              
              {/* Messages - Only show if feature is enabled */}
              {isMessagingEnabled && (
                <Link
                  to="/messages"
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </div>
                    <UnreadBadge className="h-5 w-5 min-w-[1.25rem] text-xs" />
                  </div>
                </Link>
              )}
              
              {/* Settings */}
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </div>
              </Link>
              
              {/* Admin - Only show if user is admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </div>
                </Link>
              )}
              
              {/* User's Groups Section */}
              {groups.length > 0 && !groupsLoading && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Your Groups
                      </span>
                      <Link 
                        to="/groups"
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                        onClick={() => setIsOpen(false)}
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-1">
                      {groups.slice(0, 3).map((group) => (
                        <Link
                          key={group.id}
                          to={getGroupUrl(group)}
                          className="block py-1 text-sm text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 truncate"
                          onClick={() => setIsOpen(false)}
                        >
                          {group.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* User's Resources Section */}
              {resources.length > 0 && !resourcesLoading && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <span className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Your Resources
                      </span>
                      <Link 
                        to="/resources"
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                        onClick={() => setIsOpen(false)}
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-1">
                      {resources.slice(0, 3).map((resource) => (
                        <Link
                          key={resource.id}
                          to={getResourceUrl(resource)}
                          className="block py-1 text-sm text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 truncate"
                          onClick={() => setIsOpen(false)}
                        >
                          {resource.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* User's Marketplace Items Section - Only show if feature is enabled */}
              {isMarketplaceEnabled && marketplaceItems.length > 0 && !marketplaceLoading && (
                <>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      <span className="flex items-center">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        Your Listings
                      </span>
                      <Link
                        to="/marketplace"
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                        onClick={() => setIsOpen(false)}
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-1">
                      {marketplaceItems.slice(0, 3).map((item) => (
                        <Link
                          key={item.id}
                          to={getMarketplaceListingUrl(item)}
                          className="block py-1 text-sm text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 truncate"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </div>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </div>
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign up
                </div>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}