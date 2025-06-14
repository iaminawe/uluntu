export interface AdminFeature {
  id: string;
  feature_key: string;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AdminFeatureTranslation {
  id: string;
  feature_id: string;
  language_code: string;
  translations: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, string[]>;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModerationItem {
  id: string;
  entity_type: 'members' | 'companies' | 'groups' | 'events' | 'news' | 'resources' | 'marketplace' | 'opportunities';
  entity_id: string;
  action_type: 'create' | 'update' | 'delete';
  content: Record<string, any>;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  submitted_by_user?: { email: string };
  reviewed_by_user?: { email: string };
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: { email: string };
}

export interface AdminStats {
  totalUsers: number;
  totalMembers: number;
  totalCompanies: number;
  totalGroups: number;
  totalEvents: number;
  totalNews: number;
  totalResources: number;
  totalMarketplaceListings: number;
  totalOpportunities: number;
  pendingModeration: number;
  recentActivity: AuditLogEntry[];
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface FeatureConfig {
  maxItems?: number;
  requireApproval?: boolean;
  allowedRoles?: string[];
  customFields?: any;
  [key: string]: any;
}