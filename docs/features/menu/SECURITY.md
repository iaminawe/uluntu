# Menu Management Security Implementation

## Overview

This document outlines the comprehensive security enhancements implemented for the menu management system. The security system follows the principle of least privilege and provides multiple layers of protection.

## Security Components

### 1. Role-Based Access Control (RBAC)

The menu system implements a hierarchical RBAC system with the following roles:

- **superadmin**: Full access to all menu operations
- **admin**: Standard administrative access
- **menu_manager**: Specialized menu management role
- **menu_editor**: Limited menu editing capabilities
- **content_editor**: Content-focused menu operations
- **auditor**: Read-only access to audit logs

### 2. Menu Permission System

#### Permission Actions
- `read`: View menu management interface
- `create`: Create new menu items
- `update`: Modify existing menu items
- `delete`: Remove menu items (with cascade)
- `toggle`: Enable/disable menu items
- `manage_visibility`: Control menu visibility settings
- `manage_permissions`: Modify menu permissions
- `view_audit_logs`: Access audit trail
- `bulk_operations`: Perform bulk actions
- `export`: Export menu structures

#### Visibility Levels
- **public**: Visible to all users
- **authenticated**: Visible to logged-in users only
- **admin**: Visible to administrators only
- **role_based**: Visible to users with specific roles

### 3. Security Rules Matrix

| Action | Superadmin | Admin | Menu Manager | Content Editor | Menu Editor |
|--------|------------|-------|--------------|----------------|-------------|
| Read Menus | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Items | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Items | ✅ | ✅ | ✅ | ✅* | ✅* |
| Delete Items | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Visibility | ✅ | ✅ | ❌ | ❌ | ❌ |
| Bulk Operations | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ✅ | ❌ | ❌ |

*Limited to specific conditions

## Implementation Details

### 1. Core Security Files

```
src/features/menu/security/
├── MenuPermissions.ts          # Core permission system
├── MenuSecurityManager.ts      # Security validation logic
└── SecurityRules.ts            # Permission rule definitions

src/features/menu/hooks/
├── useMenuSecurity.ts          # React security hooks
└── useMenuAuditLogs.ts        # Audit log access

src/features/menu/api/
├── secureMenuApi.ts           # Secure API layer
└── permissionValidation.ts    # API permission checks

src/features/menu/components/
├── MenuAdminGuard.tsx         # Permission guard components
├── MenuVisibilityIndicator.tsx # Security status display
└── MenuAuditLogModal.tsx      # Audit log viewer

src/features/menu/middleware/
├── MenuPermissionMiddleware.ts # Route protection
└── AdminRouteGuards.ts        # Admin access control
```

### 2. Database Schema

The security system uses the following tables:

#### menu_audit_logs
```sql
- id: UUID (Primary Key)
- menu_item_id: UUID (Foreign Key)
- action: VARCHAR(50) (Action performed)
- user_id: UUID (User who performed action)
- user_email: VARCHAR(255) (User email)
- resource_type: VARCHAR(50) (Type of resource)
- old_values: JSONB (Previous state)
- new_values: JSONB (New state)
- metadata: JSONB (Additional context)
- created_at: TIMESTAMPTZ
```

#### menu_permissions
```sql
- id: UUID (Primary Key)
- menu_item_id: UUID (Foreign Key)
- role_name: VARCHAR(100) (Required role)
- permission_type: VARCHAR(50) (Permission action)
- is_allowed: BOOLEAN (Permission granted)
- conditions: JSONB (Additional conditions)
- created_at: TIMESTAMPTZ
- created_by: UUID (Creator user ID)
```

#### menu_feature_flags
```sql
- id: UUID (Primary Key)
- flag_id: VARCHAR(100) (Unique flag identifier)
- name: VARCHAR(255) (Display name)
- enabled: BOOLEAN (Flag status)
- rollout_percentage: INTEGER (Gradual rollout)
- target_roles: TEXT[] (Target roles)
- target_users: TEXT[] (Target users)
- conditions: JSONB (Additional conditions)
```

### 3. API Security Integration

#### Secure API Usage
```typescript
import { createSecureMenuApi } from '@/features/menu/api/secureMenuApi';
import { useMenuSecurity } from '@/features/menu/hooks/useMenuSecurity';

// Create secure API instance
const secureApi = createSecureMenuApi({
  userId: user.id,
  userEmail: user.email,
  userRoles: userRoles,
  sessionId: sessionId,
  ipAddress: clientIp
});

// Perform operations with built-in security
const result = await secureApi.createMenuItem(menuData);
if (!result.success) {
  console.error('Security check failed:', result.error);
}
```

#### Permission Hooks
```typescript
const menuSecurity = useMenuSecurity();

// Check specific permissions
const canCreate = menuSecurity.canCreateMenuItems;
const canManageVisibility = menuSecurity.canManageVisibility;

// Validate before operations
const validation = menuSecurity.validateMenuItem(menuItem);
if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
}

// Filter visible items
const visibleItems = menuSecurity.filterVisibleMenuItems(allItems);
```

### 4. Component Protection

#### Permission Guards
```typescript
import { MenuAdminGuard, MenuItemGuard } from '@/features/menu/components/MenuAdminGuard';

// Protect entire features
<MenuAdminGuard requiredPermissions={[{ resource: 'menu_management', action: 'read' }]}>
  <MenuManagementInterface />
</MenuAdminGuard>

// Protect specific operations
<MenuItemGuard menuItem={item} action="delete">
  <DeleteButton />
</MenuItemGuard>
```

#### Higher-Order Components
```typescript
import { withMenuPermission } from '@/features/menu/middleware/MenuPermissionMiddleware';

// Protect route components
const ProtectedMenuPage = withMenuPermission(
  'menu_management',
  'read',
  { redirectTo: '/unauthorized' }
)(MenuManagementPage);
```

## Security Features

### 1. Cascading Permissions
Parent menu item permissions automatically apply to child items, preventing privilege escalation through nested menu structures.

### 2. Audit Trail
All menu operations are automatically logged with:
- User identification
- Action performed
- Before/after state
- IP address and session tracking
- Timestamp and metadata

### 3. Feature Flag Integration
Menu items can be gated behind feature flags for:
- Gradual rollout of new features
- A/B testing
- Role-based feature access
- Geographic restrictions

### 4. URL Security Validation
- JavaScript URL prevention
- External link validation
- Path traversal protection
- Malicious script detection

### 5. Bulk Operation Safety
- Individual permission checks for each item
- Transaction rollback on partial failures
- Rate limiting for bulk operations
- Administrative oversight requirements

## Usage Examples

### 1. Creating a Secure Menu Item
```typescript
// Validate permissions first
const validation = await menuSecurity.validateMenuItem({
  title: 'Admin Panel',
  url: '/admin',
  visibility: 'admin',
  required_roles: ['admin', 'superadmin']
});

if (validation.valid) {
  const result = await secureMenuApi.createMenuItem(menuData);
}
```

### 2. Implementing Conditional Visibility
```typescript
// In React component
const menuItems = useMemo(() => {
  return menuSecurity.filterVisibleMenuItems(allMenuItems);
}, [allMenuItems, menuSecurity]);
```

### 3. Audit Log Analysis
```typescript
const { data: auditLogs } = useMenuAuditLogs({
  menuItemId: 'item-id',
  action: 'delete',
  fromDate: '2023-01-01'
});
```

## Security Best Practices

### 1. Principle of Least Privilege
- Users receive only the minimum permissions necessary
- Permissions can be escalated but not assumed
- Default deny for undefined actions

### 2. Defense in Depth
- Multiple validation layers
- Client-side and server-side checks
- Database-level security policies
- Audit logging at all levels

### 3. Secure by Default
- New menu items default to restricted visibility
- External links require explicit approval
- Administrative actions require confirmation
- Failed operations are logged and monitored

### 4. Regular Security Reviews
- Periodic audit log analysis
- Permission matrix reviews
- Security rule validation
- Vulnerability assessments

## Monitoring and Alerting

### 1. Security Events to Monitor
- Failed permission checks
- Suspicious bulk operations
- Privilege escalation attempts
- Unusual access patterns
- Feature flag manipulation

### 2. Audit Log Queries
```sql
-- Recent admin actions
SELECT * FROM menu_audit_logs 
WHERE action IN ('delete', 'manage_permissions') 
AND created_at > NOW() - INTERVAL '24 hours';

-- Failed security checks
SELECT metadata->>'failureReason', COUNT(*) 
FROM menu_audit_logs 
WHERE metadata->>'securityCheckFailed' = 'true'
GROUP BY metadata->>'failureReason';
```

## Migration Guide

### 1. Existing Installations
1. Run the security migration: `20250819000010_create_menu_security_system.sql`
2. Update menu items with visibility settings
3. Assign appropriate roles to users
4. Configure feature flags
5. Test permission boundaries

### 2. New Installations
The security system is enabled by default with sensible defaults.

## Troubleshooting

### Common Issues
1. **Permission Denied**: Check user roles and menu visibility settings
2. **Audit Logs Empty**: Verify RLS policies and user permissions
3. **Feature Flags Not Working**: Check flag configuration and rollout percentage
4. **Bulk Operations Failing**: Review individual item permissions

### Debug Mode
Enable debug logging by setting:
```typescript
const menuSecurity = useMenuSecurity({ debug: true });
```

## Conclusion

This comprehensive security implementation provides enterprise-grade protection for menu management while maintaining usability. The system is designed to be:

- **Secure**: Multiple layers of validation and protection
- **Auditable**: Complete action tracking and logging
- **Flexible**: Configurable permissions and feature flags
- **Scalable**: Efficient queries and caching
- **Maintainable**: Clear separation of concerns and documentation

The security system follows industry best practices and provides the foundation for secure menu management in production environments.