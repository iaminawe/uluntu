// GroupsList types
import { Group as MainGroup, GroupMember as MainGroupMember } from '../../types';

// Re-export the visibility type from the main Group type
export type GroupVisibility = 'open' | 'closed' | 'secret';

// Use the main Group type directly
export type Group = MainGroup;

// Use the main GroupMember type directly
export type GroupMember = MainGroupMember;

 
export interface GroupFilters {
  search?: string;
  visibility?: GroupVisibility[];
}

 
export interface GroupsListProps {
  searchTerm: string;
  visibilityFilter: GroupVisibility[];
  groups?: Group[]; // Optional groups prop to pass data directly
}
