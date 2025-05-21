// GroupsList types

export type GroupVisibility = 'open' | 'closed' | 'secret';

export interface GroupMember {
  id: number;
  name: string;
  image: string;
  role: 'admin' | 'member';
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
  lastActive?: string;
  members?: GroupMember[];
}

export interface GroupFilters {
  search?: string;
  visibility?: GroupVisibility[];
}
