# Contact Submissions Inbox System - Database Schema Design

## Overview

This document outlines the comprehensive database schema design for a contact submissions inbox system with advanced ticket management functionality. The system integrates seamlessly with the existing Nelson Tech platform architecture, leveraging existing authentication, member management, and audit infrastructure.

## Architecture Integration

### Existing System Integration
- **Authentication**: Leverages Supabase `auth.users` table for admin user management
- **Member System**: Links to existing `public.members` table for automatic member identification
- **Role System**: Utilizes existing `public.user_roles` for permission management
- **Audit Infrastructure**: Integrates with existing audit logging patterns

### Core Design Principles
1. **Privacy-First**: Submissions are private by default with strict RLS policies
2. **Audit Trail**: Complete history tracking for compliance and accountability
3. **Scalability**: Optimized indexes and efficient query patterns
4. **Flexibility**: Tag-based categorization with extensible metadata
5. **Integration-Ready**: Designed to work with email services and automation

## Database Schema

### 1. Core Tables

#### `contact_submissions` (Primary Table)
The central table storing all contact form submissions with comprehensive ticket management.

**Contact Data Fields:**
- `name` (TEXT, NOT NULL): Submitter's full name
- `email` (TEXT, NOT NULL): Contact email address
- `phone` (TEXT): Optional phone number
- `subject` (TEXT, NOT NULL): Subject line of inquiry
- `message` (TEXT, NOT NULL): Full message content
- `organization` (TEXT): Company/organization if provided

**Ticket Management Fields:**
- `status` (ENUM): 'open', 'in_progress', 'resolved', 'closed', 'spam'
- `priority` (ENUM): 'low', 'medium', 'high', 'urgent'
- `assigned_to` (UUID): References `auth.users(id)` for assignment
- `category` (TEXT): Broad categorization (e.g., 'support', 'partnership')
- `tags` (TEXT[]): Flexible tagging system for detailed categorization

**Member Integration:**
- `member_id` (UUID): Auto-linked to `public.members` if email matches registered user

**Audit Trail:**
- `created_at`, `updated_at`: Standard timestamps
- `resolved_at`, `closed_at`: Status-specific timestamps
- `assigned_at`, `assigned_by`: Assignment tracking

**Metadata:**
- `source`: How submission was received ('contact_form', 'email', 'chat')
- `ip_address`, `user_agent`, `referrer`: Request metadata
- `internal_notes`: Private admin notes

**Response Tracking:**
- `response_sent`, `response_sent_at`, `response_sent_by`: Email response tracking
- `auto_response_sent`: Auto-response flag
- `follow_up_required`, `follow_up_date`: Follow-up management

#### `contact_submission_tags` (Tag Management)
Predefined tags for consistent categorization.

**Fields:**
- `name`, `slug`: Human-readable and URL-safe identifiers
- `description`: Tag explanation
- `color`: Hex color for UI display
- `is_system`: Distinguishes system vs user-created tags
- `category`: Groups related tags together

**Default System Tags:**
- General Inquiry, Membership, Partnership, Support
- Event Inquiry, Media Request, Bug Report, Feature Request
- Spam, Urgent (priority markers)

#### `contact_submission_history` (Audit Trail)
Complete audit trail for all submission changes.

**Change Tracking:**
- `field_changed`: Which field was modified
- `old_value`, `new_value`: Before/after values
- `change_type`: Categorized change types ('status_change', 'assignment', etc.)
- `changed_by`, `changed_at`: Who and when
- `comment`: Optional admin comment
- `automated`: Flag for system-generated changes

#### `contact_submission_responses` (Response Management)
Tracks all email responses sent to submitters.

**Response Data:**
- `subject`, `body`: Email content
- `response_type`: 'auto_response', 'manual_response', 'follow_up'
- `sent_by`, `sent_at`: Delivery tracking
- `delivery_status`: Email delivery status
- `external_message_id`: Integration with email services
- `template_used`, `template_data`: Template system integration

#### `contact_submission_attachments` (File Management)
Future-ready attachment handling.

**File Data:**
- `filename`, `original_filename`: File identification
- `file_size`, `mime_type`: File metadata
- `storage_path`, `storage_bucket`: Storage location
- Upload tracking and user association

### 2. Performance Optimization

#### Strategic Indexes
```sql
-- Status and priority for dashboard queries
idx_contact_submissions_status_priority

-- Assignment queries for workload distribution
idx_contact_submissions_assigned_open

-- Email lookups for member linking
idx_contact_submissions_email

-- Tag-based filtering (GIN index for array operations)
idx_contact_submissions_tags

-- Time-based queries for reporting
idx_contact_submissions_created_at
```

#### Query Optimization Patterns
- Composite indexes for common filter combinations
- Partial indexes for active ticket queries
- GIN indexes for array and JSONB operations
- Efficient joins with existing member/user tables

### 3. Security Implementation

#### Row Level Security (RLS) Policies

**Submission Access:**
- Anonymous users: INSERT only (contact form submissions)
- Admins: Full access to all submissions
- Assigned users: Read access to their assigned tickets

**Administrative Tables:**
- Tags, History, Responses: Admin-only access
- Strict role-based permissions using existing `user_roles` table

**Data Protection:**
- No public read access to personal information
- Audit logging for all administrative actions
- Secure handling of sensitive contact data

### 4. Automation & Triggers

#### Automated Workflows

**Member Linking:**
```sql
-- Automatically links submissions to registered members by email
auto_link_submission_to_member()
```

**Change Logging:**
```sql
-- Comprehensive audit trail for all modifications
log_contact_submission_change()
```

**Status Management:**
```sql
-- Automatic timestamp updates for status transitions
update_contact_submission_updated_at()
```

#### Business Logic Enforcement
- Status transition validation (can't assign 'in_progress' without assignee)
- Automatic timestamp setting for resolution/closure
- Change history generation for all significant modifications

### 5. Analytics & Reporting

#### Dashboard Statistics View
```sql
contact_submission_stats VIEW
```

**Key Metrics:**
- Total submissions and status breakdown
- Priority distribution and urgent counts
- Unassigned active tickets
- Recent activity (7-day window)
- Response rate tracking
- Average resolution time

#### Reporting Capabilities
- Time-series analysis of submission volume
- Assignment workload distribution
- Response time SLA tracking
- Tag-based categorization analytics
- Member vs non-member submission ratios

## Integration Points

### 1. Frontend Integration
- React components for admin dashboard
- Real-time notifications for new submissions
- Bulk actions for ticket management
- Tag-based filtering and search

### 2. Email Service Integration
- Template-based auto-responses
- Manual response tracking
- Delivery status monitoring
- Bounce and spam handling

### 3. Existing System Connections
- User authentication and role management
- Member profile integration
- Audit logging consistency
- Permission inheritance

## Scalability Considerations

### Performance
- Optimized for high-volume submission intake
- Efficient queries for admin dashboard operations
- Proper indexing for tag-based filtering
- Minimal impact on existing system performance

### Maintenance
- Automated cleanup for old resolved tickets
- Archive strategies for long-term data retention
- Performance monitoring and optimization hooks

### Extensibility
- Plugin architecture for custom automation
- Webhook integration points
- Custom field support through JSONB metadata
- Integration with external CRM systems

## Security & Compliance

### Data Privacy
- GDPR-compliant data handling
- Personal information encryption at rest
- Secure deletion capabilities
- Access logging for compliance audits

### Access Control
- Role-based permissions
- Field-level security
- API access controls
- Admin action auditing

## Implementation Status

✅ **Database Schema**: Complete migration file created
✅ **Security Policies**: RLS policies implemented
✅ **Automation**: Triggers and functions deployed
✅ **Performance**: Strategic indexes defined
✅ **Integration**: Member linking and audit trail
⏳ **Frontend**: Admin interface (next phase)
⏳ **Email Integration**: Response system (next phase)
⏳ **API**: RESTful endpoints (next phase)

## Next Steps

1. **Frontend Development**
   - Admin dashboard for ticket management
   - Public contact form implementation
   - Real-time notifications

2. **Email Integration**
   - Response template system
   - Auto-response configuration
   - Delivery tracking integration

3. **Automation Enhancement**
   - Smart categorization
   - SLA monitoring
   - Escalation workflows

4. **Analytics Dashboard**
   - Performance metrics
   - Reporting interface
   - Export capabilities

This comprehensive system provides a production-ready foundation for contact management with enterprise-level features while maintaining simplicity and integration with the existing platform architecture.