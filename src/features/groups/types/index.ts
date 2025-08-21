// Groups types
export interface Group {
  id: string;
  name: string;
  description?: string;
  longDescription?: string;
  visibility: 'public' | 'private' | 'members_only';
  heroImage?: string;
  coverImage?: string;
  status?: 'published' | 'draft';
  featured?: boolean;
  memberCount?: number;
  eventCount?: number;
  resourceCount?: number;
  postCount?: number;
  lastActive?: string;
  members?: GroupMember[];
  events?: GroupEvent[];
  created_at: string;
  updated_at?: string;
}

// Define related types with consistent string IDs
export interface GroupEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

export interface GroupResource {
  id: string;
  title: string;
  type: string;
  url: string;
  addedDate: string;
  description: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
}

export interface GroupFilters {
  search?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  image?: string;
  role: string;
  joinedDate?: string;
  title?: string;
}

export interface GroupInput {
  name: string;
  description?: string;
  visibility: 'public' | 'private' | 'members_only';
}