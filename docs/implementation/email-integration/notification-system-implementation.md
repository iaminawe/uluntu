# Email Notification System Implementation

## Overview

This is a comprehensive email notification system for contact form submissions that integrates with the existing Resend email service and admin settings system. The system provides:

- **Contact Form Management**: Complete CRUD operations for contact submissions
- **Email Notifications**: Automated notifications for new submissions, status changes, and assignments
- **Admin Dashboard**: Full-featured admin interface for managing submissions
- **Email Templates**: Configurable HTML/text email templates
- **Queue Management**: Reliable email delivery with retry logic
- **Settings Integration**: Configurable via admin settings panel

## Architecture

### 1. Database Schema

The system uses four main tables:

#### `contact_submissions`
- Stores all contact form submissions
- Includes metadata, tags, priority detection
- Full-text search capabilities
- Audit trail with timestamps

#### `email_queue`
- Manages email notification queue
- Retry logic with exponential backoff
- Status tracking and error handling

#### `submission_history`
- Tracks all changes to submissions
- Automatic triggers for status/assignment changes
- Complete audit trail

#### `notification_preferences`
- User-specific email notification settings
- Digest frequency and quiet hours
- Per-notification-type preferences

### 2. Core Services

#### `EmailNotificationService`
```typescript
// Main service for handling email notifications
emailNotificationService.sendNewSubmissionNotification(submission)
emailNotificationService.sendStatusChangeNotification(submission, oldStatus, newStatus, changedBy)
emailNotificationService.sendAssignmentNotification(submission, assignedTo, assignedBy)
```

**Features:**
- Template-based email generation
- Automatic admin email detection from settings
- Queue management with retry logic
- Rate limiting and spam prevention
- Integration with existing Resend service

#### `ContactSubmissionsAPI`
```typescript
// API for managing contact submissions
contactSubmissionsApi.createSubmission(data)
contactSubmissionsApi.getSubmissions(filters, page, limit)
contactSubmissionsApi.updateSubmission(id, data)
contactSubmissionsApi.getStats(dateRange)
```

**Features:**
- Comprehensive CRUD operations
- Advanced filtering and search
- Statistics and analytics
- Rate limiting and validation
- Automatic priority detection

### 3. React Components & Hooks

#### Hooks
- `useContactSubmissions()` - Manage submission lists with filters
- `useContactSubmission(id)` - Single submission management
- `useContactSubmissionStats()` - Dashboard statistics
- `useNotificationPreferences()` - User notification settings

#### Components
- `ContactSubmissionsPage` - Admin dashboard for submissions
- Enhanced `ContactPage` - Public contact form with validation
- Email template components (future)

## Email Notification Types

### 1. New Submission Notifications
**Trigger**: When a contact form is submitted
**Recipients**: Admin emails from settings
**Template**: Includes submission details, priority, and admin action links

### 2. Status Change Notifications
**Trigger**: When submission status changes
**Recipients**: Admin emails and assigned users
**Template**: Shows status transition and who made the change

### 3. Assignment Notifications
**Trigger**: When submission is assigned to a user
**Recipients**: Assigned user
**Template**: Assignment details and action links

### 4. Auto-Reply Emails
**Trigger**: Configurable delay after submission
**Recipients**: Original submitter
**Template**: Confirmation with ticket number and response time

## Email Templates

All templates support both HTML and text formats with variable substitution:

### Variables Available
- `{{submission.name}}` - Submitter name
- `{{submission.email}}` - Submitter email
- `{{submission.subject}}` - Subject line
- `{{submission.message}}` - Message content
- `{{submission.id}}` - Ticket number
- `{{ticket_url}}` - Link to admin view
- `{{estimated_response_time}}` - Based on submission type

### Template Customization
Templates can be customized through the admin settings:
```typescript
const templates = {
  new_submission: {
    subject: 'New Contact Submission: {{submission.subject}}',
    html_template: '<html>...</html>',
    text_template: 'Plain text version...',
    variables: ['submission', 'ticket_url']
  }
}
```

## Configuration

### Admin Settings Integration

The system integrates with the existing settings system:

```typescript
// Contact settings in admin panel
{
  'admin_notification_emails': ['admin@kootenaytech.community'],
  'auto_reply_enabled': true,
  'auto_reply_delay_minutes': 5,
  'rate_limit_per_hour': 5,
  'rate_limit_per_day': 10,
  'spam_threshold': 5
}
```

### Environment Variables
```bash
VITE_RESEND_API_KEY=your_resend_api_key
VITE_SUPPORT_EMAIL=support@kootenaytech.community
VITE_SUPPORT_NAME=Kootenay Tech Community Support
VITE_APP_URL=https://yoursite.com
```

## Features

### Automatic Priority Detection
The system automatically detects priority based on keywords:
- **Urgent**: "urgent", "emergency", "critical", "security", "hack"
- **High**: "important", "problem", "error", "deadline", "payment"
- **Medium**: "question", "help", "support", "feature request"
- **Low**: Default for other inquiries

### Spam Prevention
- Rate limiting (5 submissions per email per hour)
- Spam score calculation based on content analysis
- CAPTCHA integration ready (future enhancement)

### Tag Extraction
Automatic tag extraction from content:
- Technical, Event, Partnership, Membership
- Volunteer, Feedback, Billing, Urgent

### Queue Management
- Exponential backoff retry logic
- Maximum retry attempts (3 by default)
- Queue status monitoring
- Failed email recovery

## API Endpoints

### Public Endpoints
```
POST /api/contact-submissions - Create new submission
```

### Admin Endpoints
```
GET /api/admin/contact-submissions - List submissions with filters
GET /api/admin/contact-submissions/:id - Get single submission
PUT /api/admin/contact-submissions/:id - Update submission
DELETE /api/admin/contact-submissions/:id - Delete submission
GET /api/admin/contact-submissions/stats - Get statistics
GET /api/admin/contact-submissions/export - Export CSV
```

## Database Functions

### Statistics Function
```sql
SELECT get_submission_stats('2024-01-01', '2024-12-31');
```

### Search Function
```sql
SELECT * FROM search_submissions(
  search_term := 'urgent',
  status_filter := ARRAY['new', 'in_progress'],
  page_size := 25,
  page_offset := 0
);
```

## Security

### Row Level Security (RLS)
- Public can only create submissions
- Admins can view/edit all submissions
- Users can manage their own notification preferences

### Data Protection
- IP address and user agent logging for analytics
- Email validation and sanitization
- SQL injection protection via parameterized queries

## Monitoring & Analytics

### Email Delivery Tracking
- Integration with Resend webhooks
- Delivery, bounce, and open tracking
- Failed delivery notifications

### Submission Analytics
- Response time tracking
- Volume analytics by type/priority
- Admin performance metrics

## Installation & Setup

### 1. Database Migration
```bash
# Run the migration file
supabase db migrate 20250622000008_create_contact_submissions.sql
```

### 2. Environment Setup
```bash
# Add to your .env file
VITE_RESEND_API_KEY=your_key_here
VITE_SUPPORT_EMAIL=support@yoursite.com
```

### 3. Start Email Queue Processor
```typescript
// In your app initialization
import { emailNotificationService } from '@/services/emailNotificationService';
emailNotificationService.startQueueProcessor();
```

### 4. Add Admin Route
```typescript
// Add to your admin routes
import ContactSubmissionsPage from '@/pages/admin/ContactSubmissionsPage';

{
  path: '/admin/contact-submissions',
  component: ContactSubmissionsPage,
  permissions: ['admin', 'super_admin']
}
```

## Usage Examples

### Creating a Submission
```typescript
import { useContactSubmissions } from '@/hooks/useContactSubmissions';

const { createSubmission } = useContactSubmissions({ autoFetch: false });

const handleSubmit = async (formData) => {
  const result = await createSubmission({
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
    type: 'support',
    metadata: { source: 'contact_page' }
  });
  
  if (result.success) {
    // Show success message
  } else {
    // Handle error
  }
};
```

### Admin Dashboard Usage
```typescript
import { useContactSubmissions } from '@/hooks/useContactSubmissions';

const AdminDashboard = () => {
  const { 
    submissions, 
    loading, 
    updateSubmission 
  } = useContactSubmissions({
    filters: { status: ['new', 'in_progress'] }
  });

  const handleStatusChange = (id, status) => {
    updateSubmission(id, { status });
  };

  return (
    <div>
      {submissions.map(submission => (
        <SubmissionCard 
          key={submission.id}
          submission={submission}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};
```

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live submission updates
2. **CAPTCHA Integration**: reCAPTCHA or similar spam prevention
3. **File Attachments**: Support for file uploads in submissions
4. **Canned Responses**: Pre-written response templates
5. **SLA Tracking**: Service level agreement monitoring
6. **Advanced Analytics**: Detailed reporting and insights
7. **Mobile App**: Native mobile app for admin management

### Integration Opportunities
1. **Slack/Discord**: Real-time notifications to team channels
2. **CRM Integration**: Sync with external CRM systems
3. **Helpdesk Integration**: Connect with Zendesk, Freshdesk, etc.
4. **AI-Powered**: Automatic categorization and response suggestions

## Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check Resend API key configuration
   - Verify admin email settings
   - Check email queue status

2. **Database Permissions**
   - Ensure RLS policies are correctly applied
   - Verify user roles and permissions

3. **Rate Limiting**
   - Adjust rate limits in settings
   - Check for legitimate high-volume scenarios

### Debugging
```typescript
// Check email queue status
console.log(emailNotificationService.getQueueStatus());

// Retry failed emails
await emailNotificationService.retryFailedEmails();

// Clear sent emails from queue
emailNotificationService.clearSentEmails();
```

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Full-text search indexes for content search
- Proper pagination for large datasets

### Email Queue Management
- Background processing to avoid blocking UI
- Queue size monitoring and alerts
- Automatic cleanup of old processed emails

### Caching Strategy
- Cache frequently accessed settings
- Redis integration for high-volume scenarios
- CDN for email template assets

## Conclusion

This email notification system provides a robust, scalable solution for managing contact form submissions with comprehensive email notifications. It integrates seamlessly with the existing codebase while providing room for future enhancements and customizations.

The system is designed with reliability, security, and user experience in mind, making it suitable for production use in community platforms and business applications.