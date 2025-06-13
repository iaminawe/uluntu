// Types for GroupDetailPage components
import { Group, Event as GroupEvent, GroupMember, Resource as GroupResource, GroupPost } from '../../types';

export type TabType = 'about' | 'events' | 'members' | 'resources' | 'posts';

export interface PageHeaderProps {
  group: Group;
  setShowJoinModal: (show: boolean) => void;
}

export interface TabsProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
  group: Group;
}

export interface AboutTabProps {
  group: Group;
}

export interface EventsTabProps {
  events: GroupEvent[];
  isLoading: boolean;
}

export interface MembersTabProps {
  members: GroupMember[];
  isLoading: boolean;
  groupId?: string;
}

export interface ResourcesTabProps {
  resources: GroupResource[];
  isLoading: boolean;
  groupId?: string;
}

export interface PostsTabProps {
  posts: GroupPost[];
  isLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LoadingStateProps {
  // Can include any customization props in the future
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}

export interface VisibilityHelperProps {
  getVisibilityIcon: (visibility?: 'open' | 'closed' | 'secret') => JSX.Element | null;
  getVisibilityLabel: (visibility?: 'open' | 'closed' | 'secret') => string;
}
