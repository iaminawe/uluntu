# Admin Area Implementation Plan - SPARC Framework

## Specification

### Overview
Create a comprehensive admin area for Nelson Tech platform that provides super admins with full control over:
- Entity management (members, companies, groups, events, news, resources, marketplace, opportunities)
- User and role management
- Content moderation
- System settings with feature flags
- Internationalization configuration

### Key Requirements
1. **Access Control**: Only visible and accessible to users with `superadmin` role
2. **Entity Management**: CRUD operations for all entities with bulk actions
3. **User Management**: View, edit, assign roles, suspend/activate users
4. **Role Management**: Define and manage custom roles with granular permissions
5. **Moderation**: Review and approve/reject user-generated content
6. **Settings**: Feature toggles and configuration for each module
7. **I18n Management**: Configure translations and language settings per feature

## Pseudocode

### 1. Database Schema Extensions
```sql
-- Feature flags and settings
CREATE TABLE admin_features (
  id UUID PRIMARY KEY,
  feature_key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature translations
CREATE TABLE admin_feature_translations (
  id UUID PRIMARY KEY,
  feature_id UUID REFERENCES admin_features(id),
  language_code TEXT NOT NULL,
  translations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, language_code)
);

-- Custom roles
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation queue
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  content JSONB NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Audit log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Admin Route Structure
```
/admin
  /dashboard - Overview with stats and recent activity
  /entities
    /members - Member management
    /companies - Company management
    /groups - Group management
    /events - Event management
    /news - News management
    /resources - Resource management
    /marketplace - Marketplace management
    /opportunities - Opportunity management
  /users - User account management
  /roles - Role and permission management
  /moderation - Content moderation queue
  /settings
    /features - Feature flags and module configuration
    /i18n - Translation management
    /system - System-wide settings
  /audit - Audit log viewer
```

### 3. Component Architecture
```typescript
// Admin layout wrapper
AdminLayout
  ├── AdminSidebar (navigation)
  ├── AdminHeader (user info, notifications)
  └── AdminContent (dynamic content area)

// Entity management components
EntityTable
  ├── DataTable (reusable with sorting, filtering, pagination)
  ├── BulkActions (delete, export, status change)
  ├── QuickEdit (inline editing)
  └── DetailModal (view/edit in modal)

// Settings components
FeatureManager
  ├── FeatureToggle (enable/disable)
  ├── FeatureConfig (JSON editor for settings)
  └── TranslationEditor (per-feature translations)

// Moderation components
ModerationQueue
  ├── QueueFilters (by type, status, date)
  ├── ContentPreview (show changes)
  ├── ApprovalActions (approve/reject with notes)
  └── ModerationHistory
```

## Architecture

### 1. State Management Structure
```typescript
// New Redux slices
adminSlice
  ├── features (feature flags and configs)
  ├── roles (custom roles)
  ├── moderation (queue items)
  ├── audit (log entries)
  └── stats (dashboard metrics)

// Enhanced existing slices
authSlice (add permission checking)
contentSlice (add admin translation management)
```

### 2. API Layer Organization
```typescript
/src/api/admin/
  ├── features.ts - Feature flag CRUD
  ├── roles.ts - Role management
  ├── moderation.ts - Moderation queue
  ├── audit.ts - Audit logging
  ├── stats.ts - Dashboard statistics
  └── entities/ - Enhanced entity APIs with admin capabilities
```

### 3. Permission System
```typescript
interface Permission {
  resource: string; // 'members', 'companies', etc.
  actions: string[]; // ['create', 'read', 'update', 'delete']
  conditions?: Record<string, any>; // Additional constraints
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

// Permission checking
canUser(user, action, resource, entity?)
```

### 4. Feature Flag System
```typescript
interface Feature {
  key: string; // 'events', 'marketplace', etc.
  enabled: boolean;
  config: {
    maxItems?: number;
    requireApproval?: boolean;
    allowedRoles?: string[];
    customFields?: any;
  };
  translations: Record<string, Translation>;
}
```

## Refactoring

### 1. Enhance Existing Components
- Add admin-specific views to existing entity pages
- Extend data tables with admin actions
- Add permission checks to all CRUD operations

### 2. Update Authentication Flow
- Enhance `AuthContext` with permission checking
- Update `ProtectedRoute` to support role-based routing
- Add `AdminRoute` component for admin-only routes

### 3. Modify API Calls
- Add admin endpoints with enhanced capabilities
- Include audit logging in all admin actions
- Add batch operations support

### 4. Database Updates
- Add indexes for admin queries
- Update RLS policies for new admin tables
- Add triggers for audit logging

## Constraints

### 1. Security Constraints
- All admin actions must be logged
- Sensitive operations require re-authentication
- API rate limiting for admin endpoints
- No direct database access from frontend

### 2. Performance Constraints
- Pagination required for all entity lists
- Lazy loading for translation data
- Caching strategy for feature flags
- Optimistic updates with rollback

### 3. UX Constraints
- Responsive design for mobile admin access
- Keyboard shortcuts for common actions
- Undo/redo for critical operations
- Clear visual distinction from regular user interface

### 4. Technical Constraints
- Must work with existing Supabase setup
- Maintain backward compatibility
- Follow existing code patterns
- Test coverage required for all admin features

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Database schema for admin features
2. Basic admin layout and routing
3. Enhanced authentication with permissions
4. Admin dashboard with stats

### Phase 2: Entity Management (Week 2)
1. Generic entity table component
2. CRUD interfaces for all entities
3. Bulk operations
4. Export functionality

### Phase 3: User & Role Management (Week 3)
1. User management interface
2. Role creation and editing
3. Permission assignment
4. User activity tracking

### Phase 4: Moderation System (Week 4)
1. Moderation queue interface
2. Content preview and comparison
3. Approval workflow
4. Moderation history

### Phase 5: Settings & I18n (Week 5)
1. Feature flag management
2. Per-feature configuration
3. Translation editor
4. Language management

### Phase 6: Polish & Testing (Week 6)
1. Audit log viewer
2. Admin notifications
3. Performance optimization
4. Comprehensive testing

## Success Metrics
- All entities manageable through admin interface
- < 3 clicks to perform common admin tasks
- < 2 second load time for admin pages
- 100% audit trail coverage
- Zero security vulnerabilities
- 90%+ test coverage for admin features