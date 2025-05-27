// GroupsList types
import { Group as MainGroup, GroupMember as MainGroupMember } from '../../types';

// Re-export the visibility type from the main Group type
export type GroupVisibility = 'open' | 'closed' | 'secret';

// Use the main Group type directly
export type Group = MainGroup;

// Use the main GroupMember type directly
export type GroupMember = MainGroupMember;

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
