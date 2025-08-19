# Unified User Management Guide

## Overview

The Unified User Management system combines user accounts and member profiles into a single, comprehensive interface for administrators. This guide covers all features and functionality of the new system.

## Features

### 1. Unified Data View
- **Combined Information**: View user account data and member profile information in one place
- **Activity Tracking**: See user activity across posts, events, and groups
- **Status Management**: Easily manage user status (Active, Blocked, Archived)
- **Profile Details**: Access job titles, companies, locations, and social links

### 2. Search and Filtering

#### Search Capabilities
- Search by name, email, company, or location
- Real-time search results
- Case-insensitive matching

#### Filter Options
- **Role Filter**: Filter users by assigned roles
- **Status Filter**: Show only active, blocked, or archived users
- **Page Size**: Adjust number of users displayed (10, 25, 50, 100)

### 3. User Actions Dropdown

Each user has an actions dropdown with the following options:

- **Edit** (Default): Opens the comprehensive edit modal
- **View**: Opens the user's public profile in a new tab
- **Block**: Temporarily blocks user access
- **Archive**: Soft-delete the user (can be restored)
- **Delete**: Permanently remove the user (requires confirmation)

### 4. Bulk Operations

Select multiple users to perform bulk actions:

1. **Select Users**: Use checkboxes to select individual users or select all
2. **Choose Action**: Select from available bulk actions
3. **Apply**: Execute the action on all selected users

Available bulk actions:
- **Activate**: Set selected users to active status
- **Block**: Block multiple users at once
- **Archive**: Archive multiple users
- **Export Selected**: Export only selected users to CSV
- **Delete**: Delete multiple users (requires confirmation)

### 5. CSV Import Feature

Import multiple users from a CSV file:

#### CSV Format
```csv
Name,Email,Title,Company,Location,Phone,Website,LinkedIn,Twitter,Bio
John Doe,john@example.com,Developer,Tech Corp,New York,+1234567890,https://johndoe.com,linkedin.com/in/johndoe,@johndoe,Experienced developer
```

#### Import Process
1. Click "Import CSV" button
2. Select your CSV file
3. Review the import preview
4. Confirm to import all users

#### Import Validation
- Duplicate emails are automatically handled
- Missing fields are set to defaults
- Invalid data is flagged before import

### 6. Export Functionality

Export user data for backup or analysis:

#### Export Options
- **Export All**: Export entire user database
- **Export Selected**: Export only selected users
- **Export Filtered**: Export current filtered results

#### Export Format
- CSV format with all user fields
- Includes timestamps and status information
- Compatible with Excel and Google Sheets

### 7. Edit Modal

The comprehensive edit modal allows editing both user account and profile information:

#### Account Information
- Email address
- Full name
- Phone number
- Account status

#### Profile Information
- Job title
- Company
- Location
- Website
- Bio
- LinkedIn URL
- Twitter handle

#### Profile Settings
- Published status (visible in directory)
- Featured member status

### 8. Pagination

Navigate through large user lists efficiently:
- Page size selection (10-100 users per page)
- Previous/Next navigation
- Current page indicator
- Automatic refresh on navigation

### 9. Activity Logging

All administrative actions are logged for audit purposes:

#### Logged Actions
- User creation, updates, and deletion
- Status changes (block, archive, activate)
- Bulk operations
- Import/export activities
- Role assignments

#### Log Information
- Administrator who performed the action
- Timestamp of the action
- Affected user(s)
- Action details

### 10. Performance Features

- **Optimized Queries**: Efficient database queries with pagination
- **Lazy Loading**: Components load on demand
- **Debounced Search**: Search queries are optimized
- **Batch Operations**: Bulk actions are processed efficiently

## Best Practices

### User Management
1. **Regular Reviews**: Periodically review user statuses
2. **Bulk Operations**: Use bulk actions for efficiency
3. **Export Backups**: Regular exports for data backup
4. **Activity Monitoring**: Review activity logs for security

### Import Guidelines
1. **Validate Data**: Review CSV data before import
2. **Test Small**: Test with small batches first
3. **Backup First**: Export existing data before large imports
4. **Clean Data**: Ensure CSV data is properly formatted

### Security Considerations
1. **Confirm Deletions**: Always confirm before deleting users
2. **Audit Logs**: Regularly review activity logs
3. **Role Management**: Assign appropriate roles carefully
4. **Status Updates**: Use block/archive instead of delete when possible

## Troubleshooting

### Common Issues

#### Search Not Working
- Clear browser cache
- Check for special characters in search term
- Ensure database connection is active

#### Import Failures
- Verify CSV format matches requirements
- Check for special characters in data
- Ensure all required fields are present

#### Export Issues
- Check browser download settings
- Ensure sufficient permissions
- Verify data exists for export

#### Performance Issues
- Reduce page size for faster loading
- Use filters to narrow results
- Clear browser cache and cookies

## Keyboard Shortcuts

- `Ctrl/Cmd + F`: Focus search field
- `Ctrl/Cmd + A`: Select all visible users
- `Ctrl/Cmd + E`: Export current view
- `Escape`: Close modals

## API Integration

The system exposes the following endpoints for integration:

### GET /api/admin/users
- Retrieve user list with pagination
- Supports filtering and sorting

### POST /api/admin/users/import
- Import users via API
- Accepts JSON or CSV format

### POST /api/admin/users/export
- Export users programmatically
- Returns CSV or JSON format

### PUT /api/admin/users/:id
- Update individual user
- Supports partial updates

### DELETE /api/admin/users/:id
- Delete individual user
- Requires admin authentication

## Updates and Maintenance

### Regular Maintenance Tasks
1. **Database Optimization**: Run monthly
2. **Log Cleanup**: Archive logs older than 90 days
3. **Export Backups**: Weekly automated exports
4. **Performance Review**: Monthly performance metrics

### Update Schedule
- Bug fixes: As needed
- Feature updates: Monthly
- Security updates: Immediate
- UI improvements: Quarterly

## Support

For additional support or feature requests:
- Email: admin@yourdomain.com
- Documentation: /docs/admin
- Issue Tracker: GitHub Issues
- Community Forum: /forum/admin

## Changelog

### Version 2.0.0 (Current)
- Unified user and member management
- CSV import/export functionality
- Bulk operations support
- Activity logging
- Advanced filtering and search
- Comprehensive edit modal
- Performance optimizations

### Version 1.0.0
- Basic user management
- Simple search
- Individual user actions
- Basic pagination