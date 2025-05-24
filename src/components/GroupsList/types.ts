// GroupsList types
import { EntityStatus } from '../../data/mock/mockData';

export type GroupVisibility = 'open' | 'closed' | 'secret';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GroupMember {
  id: number;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GroupFilters {
  search?: string;
  visibility?: GroupVisibility[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GroupsListProps {
  searchTerm: string;
  visibilityFilter: GroupVisibility[];
}
