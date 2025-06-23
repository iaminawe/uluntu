# Role Management System Requirements Analysis

## Executive Summary

The Nelson Tech platform has a multi-layered role management system that combines traditional user roles with custom roles and group-specific permissions. This analysis defines the complete requirements for proper role management across signup, group membership, admin capabilities, and permission matrices.

## Current Role System Architecture

### 1. Core Role Tables

#### A. `user_roles` Table
- **Purpose**: Stores system-level roles for users
- **Structure**: `(user_id UUID, role TEXT, created_at TIMESTAMP)`
- **System Roles**: `authenticated`, `admin`, `superadmin`

#### B. `custom_roles` Table  
- **Purpose**: Stores custom roles with granular permissions
- **Structure**: `(id UUID, name TEXT, description TEXT, permissions JSONB, is_system BOOLEAN)`
- **Features**: JSON-based permission matrix, system vs custom role distinction

#### C. `user_custom_roles` Table
- **Purpose**: Junction table linking users to custom roles
- **Structure**: `(user_id UUID, role_id UUID, assigned_at TIMESTAMP, assigned_by UUID)`

### 2. Group-Level Roles

#### A. `group_members` Table
- **Structure**: Includes `role` field with values: `admin`, `member`
- **Purpose**: Group-specific role assignment independent of system roles

## Requirements Analysis

### 1. General Role Assignment During Signup

#### Current Implementation
- **Default Role**: `authenticated` 
- **Assignment Trigger**: `handle_new_user()` function automatically assigns on signup
- **Member Profile**: Creates draft profile via `handle_new_user_profile()` function

#### Requirements
✅ **IMPLEMENTED**: Automatic `authenticated` role assignment  
❌ **MISSING**: Option to assign additional roles based on signup context  
❌ **MISSING**: Role assignment based on invitation codes or referral context  
❌ **MISSING**: Industry-specific role assignment during onboarding  

#### Recommendations
1. Add `signup_context` parameter to handle different signup flows
2. Implement invitation-based role assignment
3. Create industry/profession-based initial role suggestions

### 2. Group Membership Role Assignment

#### Current Implementation
- **Two-Tier System**: 
  - Group-level roles: `admin`, `member` (in `group_members.role`)
  - System-level roles: Independent of group membership
- **No Automatic System Role Promotion**: Joining a group doesn't affect system roles

#### Requirements
✅ **IMPLEMENTED**: Group admin/member roles  
❌ **MISSING**: Automatic system role enhancement for group members  
❌ **MISSING**: Bulk role assignment for group joining  
❌ **MISSING**: Time-limited group roles  

#### Recommendations
1. **Group Member System Role**: Consider adding `group_member` system role when user joins first group
2. **Enhanced Permissions**: Group members should get enhanced permissions for content creation
3. **Role Inheritance**: Group admins should inherit certain platform-wide permissions

### 3. Admin Role Assignment/Removal Capabilities

#### Current Implementation
- **Admin API**: Full CRUD operations via `adminRolesApi`
- **Role Management UI**: Complete role management interface in `RolesPage.tsx`
- **Permission Checking**: `checkPermission()` method for granular access control
- **System Role Protection**: System roles cannot be modified or deleted

#### Requirements
✅ **IMPLEMENTED**: Custom role creation, editing, deletion  
✅ **IMPLEMENTED**: Role assignment/removal for users  
✅ **IMPLEMENTED**: Permission matrix management  
❌ **MISSING**: Bulk user role assignment  
❌ **MISSING**: Role assignment approval workflow  
❌ **MISSING**: Time-limited role assignments  
❌ **MISSING**: Role assignment notifications  

#### Current Admin Capabilities
- Create/edit/delete custom roles
- Assign/remove roles from users
- Define granular permissions per resource
- View role usage and user assignments
- Protect system roles from modification

### 4. Superadmin Role Assignment/Removal Capabilities

#### Current Implementation
- **Database Functions**: `assign_superadmin_to_user.sql` for direct assignment
- **Manual Assignment**: Requires database-level access for initial superadmin creation
- **Full System Access**: Superadmin role has `{"*": ["*"]}` permissions

#### Requirements  
✅ **IMPLEMENTED**: Superadmin role with full system access  
✅ **IMPLEMENTED**: Database-level assignment mechanism  
❌ **MISSING**: Secure superadmin assignment/removal UI  
❌ **MISSING**: Multi-factor authentication for superadmin operations  
❌ **MISSING**: Superadmin action logging and alerts  
❌ **MISSING**: Emergency superadmin access procedures  

#### Recommendations
1. **Secure Superadmin UI**: Create highly secure interface for superadmin management
2. **Multi-Factor Auth**: Require additional authentication for superadmin operations
3. **Action Auditing**: Enhanced logging for all superadmin actions
4. **Emergency Procedures**: Define process for emergency superadmin access

### 5. Permission Matrix for Each Role Type

#### A. System Roles Permission Matrix

| Resource | Authenticated | Group Member | Admin | Superadmin |
|----------|---------------|--------------|-------|-----------|
| **Members** | Read (published only) | Read, Update (own) | Full CRUD | Full Access |
| **Companies** | Read (published only) | Read, Create (own) | Full CRUD | Full Access |
| **Groups** | Read (public) | Read, Create, Update (member) | Full CRUD | Full Access |
| **Events** | Read (public) | Read, Create (in groups) | Full CRUD | Full Access |
| **News** | Read (published) | Read | Full CRUD | Full Access |
| **Resources** | Read (public) | Read, Create | Full CRUD | Full Access |
| **Marketplace** | Read (active) | Read, Create (own) | Full CRUD | Full Access |
| **Opportunities** | Read (active) | Read, Create (own) | Full CRUD | Full Access |
| **User Management** | None | None | Read, Update | Full Access |
| **Role Management** | None | None | Custom roles only | Full Access |
| **System Settings** | None | None | Limited | Full Access |
| **Moderation** | None | None | Full access | Full Access |
| **Analytics** | None | None | Read-only | Full Access |

#### B. Custom Role Permission Structure

```json
{
  "members": ["create", "read", "update", "delete"],
  "companies": ["read", "update"],
  "events": ["*"],  // Wildcard for all permissions
  "moderation": ["read", "approve", "reject"],
  "*": ["*"]  // Superadmin wildcard
}
```

#### C. Group Role Permissions

| Action | Group Member | Group Admin |
|--------|--------------|-------------|
| View group content | ✅ | ✅ |
| Post in group | ✅ | ✅ |
| Manage group events | ❌ | ✅ |
| Moderate group content | ❌ | ✅ |
| Manage group members | ❌ | ✅ |
| Edit group settings | ❌ | ✅ |
| Delete group | ❌ | ✅ |

## Missing UI Components for Role Management

### 1. User Role Assignment Interface
❌ **MISSING**: Bulk user role assignment tool  
❌ **MISSING**: Role assignment search and filtering  
❌ **MISSING**: Role assignment history/audit trail UI  
❌ **MISSING**: Role assignment approval workflow interface  

### 2. Group Role Management
❌ **MISSING**: Group-specific role configuration  
❌ **MISSING**: Group admin dashboard for member role management  
❌ **MISSING**: Group role permission customization  

### 3. Role Analytics and Reporting
❌ **MISSING**: Role usage analytics dashboard  
❌ **MISSING**: Permission usage reports  
❌ **MISSING**: Role assignment trends  
❌ **MISSING**: Security audit reports for role changes  

### 4. Self-Service Role Management
❌ **MISSING**: User profile role request interface  
❌ **MISSING**: Role upgrade request system  
❌ **MISSING**: Role-based feature discovery  

## Security Gaps and Recommendations

### 1. Current Security Measures
✅ Row Level Security (RLS) policies  
✅ Role-based policy enforcement  
✅ System role protection  
✅ Admin action auditing  

### 2. Missing Security Features
❌ **Role Assignment Approval**: No approval workflow for sensitive role assignments  
❌ **Time-Limited Roles**: No expiration dates for temporary role assignments  
❌ **Role Conflict Detection**: No validation for conflicting role combinations  
❌ **Permission Escalation Alerts**: No monitoring for unusual permission escalations  

## Implementation Priority Recommendations

### Phase 1: Critical (Immediate)
1. **Group Member System Role**: Automatic assignment when joining first group
2. **Bulk Role Assignment**: Admin interface for managing multiple users
3. **Role Assignment Notifications**: Alert users when roles are assigned/removed
4. **Enhanced Group Role UI**: Better group-specific role management

### Phase 2: Important (Next Quarter)
1. **Role Assignment Approval Workflow**: For sensitive role changes
2. **Time-Limited Role Assignments**: Temporary role support
3. **Role Analytics Dashboard**: Usage and assignment reporting
4. **Superadmin Security Enhancement**: MFA and enhanced auditing

### Phase 3: Enhancement (Future)
1. **Industry-Specific Role Templates**: Pre-configured role sets
2. **Role-Based Feature Discovery**: Contextual feature suggestions
3. **Advanced Permission Inheritance**: Complex permission hierarchies
4. **Role Assignment API**: External system integration

## Technical Debt and Migration Needs

### 1. Database Schema Issues
- **Mixed Role Storage**: System roles in `user_roles`, custom roles in `user_custom_roles`
- **Group Role Isolation**: Group roles stored separately from system roles
- **Permission Format Inconsistency**: JSON structure variations across roles

### 2. Migration Requirements
1. **Unified Role Queries**: Create views or functions to query all user roles together
2. **Permission Normalization**: Standardize permission JSON structure
3. **Index Optimization**: Add indexes for role query performance
4. **Data Consistency**: Ensure all existing users have appropriate default roles

## Conclusion

The Nelson Tech platform has a solid foundation for role management with room for significant enhancement. The current system handles basic role assignment and custom role creation well, but lacks advanced features like approval workflows, time-limited assignments, and comprehensive analytics.

**Key Action Items:**
1. Implement group member system role assignment
2. Create bulk role management tools
3. Add role assignment approval workflows
4. Enhance security monitoring and alerts
5. Build comprehensive role analytics dashboard

**Memory Key**: swarm-auto-centralized-1750628244440/requirements/analysis