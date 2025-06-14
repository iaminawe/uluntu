# Roles

The system has the following user roles with hierarchical access levels:

*   **Superadmin:** Ultimate platform access with comprehensive administrative dashboard capabilities.
    *   **Purpose:** The superadmin role has complete control over the platform, including administrative functions and system configuration.
    *   **Interactions:** Superadmins can access the admin dashboard (`/admin` route) with full entity management, user role assignment, content moderation, feature flag configuration, internationalization management, and audit trail access. They have all capabilities of lower roles plus administrative oversight.
    *   **Access Level:** Full platform control + administrative dashboard
    *   **Database Permissions:** Full CRUD access to all tables including admin tables (admin_features, roles, user_roles, moderation_queue, admin_audit_log)

*   **Administrator:** Has full access to content management and user oversight through the standard interface.
    *   **Purpose:** The administrator role is responsible for day-to-day management and maintenance of platform content.
    *   **Interactions:** Administrators can manage users, groups, events, marketplace listings, news, resources, and all other entities through the standard platform interface. They can configure basic platform settings and handle user support.
    *   **Access Level:** Full content management (no admin dashboard access)
    *   **Database Permissions:** CRUD access to all content tables, read access to user data

*   **Moderator:** Can moderate content and manage users within defined scope.
    *   **Purpose:** The moderator role ensures platform content quality and enforces community guidelines.
    *   **Interactions:** Moderators can review and approve or reject news articles, resources, marketplace listings, and other user-submitted content. They can manage user accounts, including temporary suspensions for guideline violations.
    *   **Access Level:** Content moderation and limited user management
    *   **Database Permissions:** Update access to content status fields, limited user management capabilities

*   **Registered User:** Can create and manage events, groups, and marketplace listings.
    *   **Purpose:** The registered user role is for community members who want to actively participate in the platform.
    *   **Interactions:** The registered user can create and manage events, groups, and marketplace listings. They can also participate in discussions, submit news articles and resources, and connect with other users.

*   **Guest:** Can view content but cannot create or manage anything.
    *   **Purpose:** The guest role is for users who want to explore the platform without creating an account.
    *   **Interactions:** The guest can view events, groups, marketplace listings, news articles, and resources. They cannot create or manage anything, or participate in discussions.

*   **Company Representative:** Can manage company profile and post opportunities
    *   **Purpose:** The company representative role is for users who represent local businesses and want to promote their products and services to the community.
    *   **Interactions:** The company representative can manage the company profile, post opportunities, create events, and list products and services on the marketplace.

Each role has different levels of access and different interactions with the entities available on the platform, allowing for a structured and secure community platform.

## Role Hierarchy and Inheritance

The roles follow a hierarchical structure where higher roles inherit all permissions of lower roles:

```
Superadmin
    ↓ (inherits all permissions plus admin dashboard)
Administrator
    ↓ (inherits all permissions plus full content management)
Moderator
    ↓ (inherits all permissions plus content moderation)
Registered User
    ↓ (inherits all permissions plus content creation)
Guest
```

## Permission Matrix

### Platform Features Access

| Feature | Guest | Registered User | Moderator | Administrator | Superadmin |
|---------|-------|----------------|-----------|---------------|------------|
| View Content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Content | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Content | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete Own Content | ❌ | ✅ | ✅ | ✅ | ✅ |
| Moderate Content | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | Limited | ✅ | ✅ |
| Platform Settings | ❌ | ❌ | ❌ | Limited | ✅ |
| Admin Dashboard | ❌ | ❌ | ❌ | ❌ | ✅ |

### Administrative Dashboard Access (Superadmin Only)

| Admin Feature | Capability |
|---------------|------------|
| **Entity Management** | Full CRUD operations on all platform entities (members, companies, groups, events, news, resources, marketplace, opportunities) |
| **User & Role Management** | Assign/remove roles, manage user permissions, view user activity |
| **Content Moderation** | Review pending content, bulk approve/reject, moderation workflow management |
| **Feature Flags** | Enable/disable platform features, configure feature settings |
| **Internationalization** | Manage translations for multiple languages, add new language support |
| **Audit Trail** | View all administrative actions, export audit logs, compliance reporting |
| **Analytics Dashboard** | Platform statistics, user metrics, system health monitoring |

### Database Permissions by Role

#### Superadmin
- Full CRUD access to all tables
- Access to admin tables: `admin_features`, `roles`, `user_roles`, `moderation_queue`, `admin_audit_log`
- Can execute administrative functions and view system logs

#### Administrator  
- CRUD access to: `members`, `companies`, `groups`, `events`, `news`, `resources`, `marketplace_listings`, `opportunities`
- Read access to user data for support purposes
- Cannot access admin-specific tables

#### Moderator
- Read access to all content tables
- Update access to status fields for content moderation
- Limited user management (suspend/activate accounts)
- Access to moderation queue items

#### Registered User
- Full CRUD access to own content across all tables
- Read access to published content from other users
- Cannot modify other users' content or access user management features

#### Guest
- Read-only access to published content
- No database write permissions
- Cannot access user-specific or administrative data

## Security Implementation

### Row Level Security (RLS)
All database tables implement Row Level Security policies that enforce role-based access:

```sql
-- Example: Members table RLS policy
CREATE POLICY "Users can view published member profiles" 
ON members FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can edit own profile" 
ON members FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Superadmins have full access" 
ON members FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles ur 
  JOIN roles r ON ur.role_id = r.id 
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superadmin'
));
```

### Authentication and Authorization Flow

1. **Authentication**: User signs in via Supabase Auth
2. **Role Assignment**: User roles retrieved from `user_roles` table
3. **Permission Check**: Each request validates user permissions against role hierarchy
4. **Admin Access**: Superadmin role required for `/admin` route access
5. **Audit Logging**: All administrative actions logged automatically

### Role Assignment Process

#### Initial Setup
1. Create first user account through standard registration
2. Manually assign 'superadmin' role in Supabase dashboard:
   ```sql
   INSERT INTO user_roles (user_id, role_id, assigned_by) 
   VALUES ('user-uuid', 'superadmin-role-uuid', 'system');
   ```

#### Ongoing Management
1. Superadmins can assign roles through admin dashboard
2. Role changes are immediately effective (no logout required)
3. All role assignments are logged in audit trail
4. System roles (like 'superadmin') are protected from deletion

This comprehensive role system ensures secure, scalable access control while maintaining flexibility for different user types and administrative needs.