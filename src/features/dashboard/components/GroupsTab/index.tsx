import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Calendar,
  Eye,
  Plus,
  UserCheck,
  Crown
} from 'lucide-react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';

interface GroupsTabProps {
  contentType: 'group';
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreateGroup?: () => void;
  className?: string;
}

// Mock data for user's groups - this should be replaced with actual API call
const mockUserGroups = [
  {
    id: '1',
    name: 'Tech Enthusiasts Nelson',
    slug: 'tech-enthusiasts-nelson',
    description: 'A community for technology enthusiasts in Nelson, BC. We discuss the latest trends, share projects, and network.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop&q=80',
    memberCount: 45,
    role: 'admin', // User's role in this group
    joined_at: '2023-01-15',
    isPrivate: false,
    created_at: '2023-01-01',
    lastActivity: '2024-01-15'
  },
  {
    id: '2',
    name: 'Mountain Bikers BC',
    slug: 'mountain-bikers-bc',
    description: 'Connect with fellow mountain biking enthusiasts across British Columbia.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d10?w=400&h=200&fit=crop&q=80',
    memberCount: 128,
    role: 'member',
    joined_at: '2023-06-20',
    isPrivate: false,
    created_at: '2022-05-15',
    lastActivity: '2024-01-14'
  },
  {
    id: '3',
    name: 'Local Entrepreneurs',
    slug: 'local-entrepreneurs',
    description: 'Supporting local business owners and entrepreneurs with networking and resources.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop&q=80',
    memberCount: 32,
    role: 'moderator',
    joined_at: '2023-03-10',
    isPrivate: true,
    created_at: '2023-01-20',
    lastActivity: '2024-01-13'
  }
];

export const GroupsTab: React.FC<GroupsTabProps> = ({
  loading: propLoading = false,
  error: propError,
  onRefresh,
  onCreateGroup,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useSession();

  // In a real implementation, this would fetch groups where the user is a member
  const userGroups = mockUserGroups;

  const isLoadingState = propLoading;
  const errorState = propError;

  if (isLoadingState) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorState) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ErrorDisplay 
          error={errorState} 
          retry={onRefresh || (() => {})} 
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleViewGroup = (group: any) => {
    navigate(`/groups/${group.slug}`);
  };

  const handleManageGroup = (group: any) => {
    if (group.role === 'admin') {
      navigate(`/groups/${group.slug}/manage`);
    } else {
      navigate(`/groups/${group.slug}`);
    }
  };

  const handleCreateGroup = () => {
    if (onCreateGroup) {
      onCreateGroup();
    } else {
      navigate('/groups/create');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Groups
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Groups you've joined or created
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Groups
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userGroups.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Crown className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Groups I Admin
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userGroups.filter(g => g.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userGroups.reduce((total, group) => total + group.memberCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups List */}
      {userGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No groups yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Join existing groups or create your own to get started.
          </p>
          <button
            onClick={handleCreateGroup}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Group Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0">
                  {group.image ? (
                    <img
                      src={group.image}
                      alt={`${group.name} cover`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                      {group.name}
                    </h3>
                    {group.isPrivate && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {group.memberCount} members
                    </div>
                    <div className="flex items-center">
                      {getRoleIcon(group.role)}
                      <span className="ml-1">{getRoleLabel(group.role)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Description */}
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                {group.description}
              </p>

              {/* Group Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Joined {formatDate(group.joined_at)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Active {formatDate(group.lastActivity)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-4">
                <button 
                  onClick={() => handleViewGroup(group)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  View Group
                </button>
                <button 
                  onClick={() => handleManageGroup(group)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {group.role === 'admin' ? 'Manage' : 'Visit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsTab;