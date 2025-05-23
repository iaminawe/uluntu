// GroupsList types
import { EntityStatus } from '../../data/mock/mockData';

export type GroupVisibility = 'open' | 'closed' | 'secret';

export interface GroupMember {
  id: number;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  heroImage: string;
  visibility: GroupVisibility;
  memberCount: number;
  eventCount?: number;
  resourceCount?: number;
  postCount?: number;
  lastActive: string;
  members: GroupMember[];
  status: EntityStatus;
}

export interface GroupFilters {
  search?: string;
  visibility?: GroupVisibility[];
}

export interface GroupsListProps {
  searchTerm: string;
  visibilityFilter: GroupVisibility[];
}
