export type EntityType = 
  | 'event' 
  | 'news' 
  | 'resource' 
  | 'marketplace' 
  | 'opportunity' 
  | 'group' 
  | 'company' 
  | 'comment';

export interface Like {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  like_count?: number;
  
  // Joined data
  user?: {
    id: string;
    email?: string;
    raw_user_meta_data?: {
      name?: string;
      avatar_url?: string;
    };
  };
  member?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export interface CommentFormData {
  content: string;
  parent_id?: string;
}