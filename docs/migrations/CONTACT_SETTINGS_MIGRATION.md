# Contact Settings Migration Guide

## Overview

This migration moves hardcoded contact information and configuration values from React components to the dynamic settings system. This allows administrators to update contact information through the admin interface without requiring code changes.

## Migration Date
**2025-06-23**

## What Was Migrated

### 1. **ContactPage.tsx**
**Before:** Hardcoded values in JSX
```tsx
<p>hello@nelsontech.community</p>
<p>+1 (250) 555-0123</p>
<p>Nelson, British Columbia<br />Canada</p>
```

**After:** Dynamic values from settings
```tsx
const { value: contactEmail } = useSetting('contact', 'contact_email', 'hello@nelsontech.community');
<p>{contactEmail}</p>
```

### 2. **PrivacyPage.tsx**
**Before:** Hardcoded organization and contact details
```tsx
<p>The Nelson Tech Community ("we", "us", or "our")</p>
<p><strong>Email:</strong> privacy@nelsontech.community</p>
```

**After:** Dynamic values from settings
```tsx
const { value: organizationName } = useSetting('contact', 'organization_name', 'Nelson Tech Community');
<p>The {organizationName} ("we", "us", or "our")</p>
```

### 3. **AboutSection/index.tsx**
**Before:** Hardcoded location information
```tsx
address: [
  "Nelson Innovation Centre",
  "Box 752 - 560 Baker Street",
  "Nelson, BC V1L 4E5"
]
```

**After:** Dynamic values from settings
```tsx
const { value: locationName } = useSetting('contact', 'location_name', 'Nelson Innovation Centre');
```

## Database Changes

### New Settings Category
- **Category:** `contact`
- **Display Name:** Contact Information
- **Description:** Contact details and communication settings

### New Setting Definitions
| Setting Key | Type | Public | Default Value | Description |
|-------------|------|--------|---------------|-------------|
| `contact_email` | email | ✓ | "hello@nelsontech.community" | Primary contact email |
| `support_email` | email | ✓ | "hello@nelsontech.community" | Support email |
| `privacy_email` | email | ✓ | "privacy@nelsontech.community" | Privacy contact email |
| `contact_phone` | string | ✓ | "+1 (250) 555-0123" | Primary phone number |
| `contact_address` | string | ✓ | "Nelson, British Columbia\\nCanada" | Mailing address |
| `privacy_address` | string | ✓ | "Nelson Tech Community, Privacy Officer\\nNelson, BC, Canada" | Privacy officer address |
| `organization_name` | string | ✓ | "Nelson Tech Community" | Full organization name |
| `organization_short_name` | string | ✓ | "Nelson Tech" | Short organization name |
| `location_name` | string | ✓ | "Nelson Innovation Centre" | Primary location name |
| `location_address` | string | ✓ | "Box 752 - 560 Baker Street\\nNelson, BC V1L 4E5" | Location address |
| `hosted_by_name` | string | ✓ | "Kootenay Association for Science & Technology (KAST)" | Hosting organization |
| `hosted_by_url` | url | ✓ | "#" | Hosting organization URL |
| `maps_embed_url` | url | ✓ | "https://www.google.com/maps/embed?..." | Google Maps embed URL |
| `response_time_general` | string | ✓ | "24-48 hours" | General inquiry response time |
| `response_time_partnership` | string | ✓ | "3-5 business days" | Partnership response time |
| `response_time_support` | string | ✓ | "12-24 hours" | Support response time |
| `social_*` | url | ✓ | "" | Social media URLs |

## Implementation Details

### Using Settings in Components

```tsx
import { useSetting } from '@/hooks/useSettings';

function MyComponent() {
  const { value: contactEmail } = useSetting('contact', 'contact_email', 'default@example.com');
  
  return <p>{contactEmail}</p>;
}
```

### Graceful Degradation
All components include fallback values that match the original hardcoded values, ensuring the application works even if:
- Settings are not loaded yet
- Settings API fails
- Settings are missing from the database

### Admin Interface
Contact settings can now be managed through:
1. **Admin Dashboard** → **Settings** → **Contact Information**
2. Individual setting updates through the ContactPanel component
3. Bulk updates through the settings API

## Verification

### 1. **Run Migration**
```sql
-- Apply the migration
psql -f supabase/migrations/20250623000001_add_contact_settings_definitions.sql
```

### 2. **Verify Database**
```sql
-- Check settings exist
SELECT setting_key, default_value 
FROM settings_definitions 
WHERE category_id = (SELECT id FROM settings_categories WHERE name = 'contact');

-- Check values are inserted
SELECT setting_key, value 
FROM settings_values sv
JOIN settings_definitions sd ON sd.setting_key = sv.setting_key
WHERE sd.category_id = (SELECT id FROM settings_categories WHERE name = 'contact');
```

### 3. **Test Components**
```bash
# Run the migration test
npm test src/tests/contact-settings-migration.test.tsx

# Check TypeScript compilation
npm run typecheck

# Test in browser
npm run dev
```

### 4. **Verify Admin Interface**
1. Navigate to `/admin/settings`
2. Click on "Contact Information"
3. Verify all settings are editable
4. Make a test change and confirm it reflects on the contact page

## Helper Functions

The migration includes helper functions for database queries:

```sql
-- Get a specific contact setting
SELECT public.get_contact_setting('contact_email', 'default@example.com');

-- Get all contact settings as JSON
SELECT public.get_all_contact_settings();
```

## Rollback Plan

If issues occur, rollback by:

1. **Revert component changes:**
   ```bash
   git revert <commit-hash>
   ```

2. **Remove settings (optional):**
   ```sql
   DELETE FROM settings_values 
   WHERE setting_key IN (
     SELECT setting_key FROM settings_definitions 
     WHERE category_id = (SELECT id FROM settings_categories WHERE name = 'contact')
   );
   
   DELETE FROM settings_definitions 
   WHERE category_id = (SELECT id FROM settings_categories WHERE name = 'contact');
   
   DELETE FROM settings_categories WHERE name = 'contact';
   ```

## Benefits

1. **Dynamic Configuration:** Contact information can be updated without code changes
2. **Admin Control:** Non-technical staff can update contact details
3. **Consistency:** Single source of truth for contact information
4. **Fallback Safety:** Components work even if settings fail to load
5. **Multi-Environment:** Different settings per environment (dev/staging/prod)
6. **Audit Trail:** All changes are logged with user and timestamp
7. **Type Safety:** Settings are properly typed and validated

## Future Enhancements

1. **Real-time Updates:** WebSocket notifications when settings change
2. **Validation Rules:** Custom validation for email formats, phone numbers
3. **Localization:** Multi-language support for contact information
4. **Templates:** Email templates using contact settings
5. **API Endpoints:** Public API for accessing contact information
6. **Caching:** Redis caching for frequently accessed settings