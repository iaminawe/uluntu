# Photo Galleries Feature Toggle Documentation

## Overview
The photo galleries feature is now fully integrated with the feature toggle system. When disabled, all gallery-related functionality will be safely hidden and inaccessible.

## Feature Key
- **Feature Key**: `photo_galleries`
- **Default State**: Enabled (true)

## What the Feature Toggle Controls

### When ENABLED:
✅ **Admin Interface**
- Media Gallery menu item appears in admin sidebar
- `/admin/media` route is accessible
- Full CRUD operations for galleries available

✅ **Public Routes**
- `/galleries` - Browse public galleries
- `/galleries/create` - Create new galleries
- `/galleries/:slug` - View gallery details
- `/galleries/:slug/edit` - Edit galleries
- `/my-galleries` - User's personal galleries

✅ **API Access**
- All gallery API endpoints functional
- Photo upload/management enabled
- Comments and likes on photos

✅ **Entity Integrations**
- Galleries can be attached to groups
- Galleries can be attached to events
- Galleries can be attached to news
- Galleries can be attached to companies
- Galleries can be attached to marketplace listings
- Galleries can be attached to resources
- Galleries can be attached to pages
- Galleries can be attached to user profiles

### When DISABLED:
❌ **Admin Interface**
- Media Gallery menu item hidden
- `/admin/media` returns 404

❌ **Public Routes**
- All gallery routes return 404
- No gallery UI components render

❌ **API Access**
- Gallery API calls throw error
- Upload endpoints blocked

❌ **Entity Integrations**
- Gallery attachment fields hidden
- Existing gallery relationships preserved but inaccessible

## Database Migrations

### Enable Feature Toggle
```sql
-- Run this in Supabase SQL Editor
-- Insert or update the photo_galleries feature toggle
INSERT INTO feature_toggles (
  feature_key,
  enabled,
  description,
  config
)
VALUES (
  'photo_galleries',
  true, -- Set to true to enable, false to disable
  'Enable photo gallery system for users and entities',
  '{
    "max_photos_per_gallery": 100,
    "max_galleries_per_user": 50,
    "enable_moderation": true
  }'::jsonb
)
ON CONFLICT (feature_key) 
DO UPDATE SET
  enabled = true, -- Change this value to toggle
  updated_at = now();
```

### Disable Photo Galleries
```sql
-- To disable the feature
UPDATE feature_toggles 
SET 
  enabled = false,
  updated_at = now()
WHERE feature_key = 'photo_galleries';
```

### Enable Photo Galleries
```sql
-- To enable the feature
UPDATE feature_toggles 
SET 
  enabled = true,
  updated_at = now()
WHERE feature_key = 'photo_galleries';
```

### Check Current Status
```sql
-- Check if photo galleries are enabled
SELECT 
  feature_key,
  enabled,
  description,
  config,
  updated_at
FROM feature_toggles
WHERE feature_key = 'photo_galleries';
```

## Implementation Details

### 1. Route Protection
All gallery routes are wrapped with `FeatureGate` component:
```tsx
<FeatureGate feature="photo_galleries" fallback={<NotFoundError />}>
  {/* Gallery component */}
</FeatureGate>
```

### 2. Menu Visibility
Admin menu dynamically includes/excludes gallery item:
```tsx
const { enabled: photoGalleriesEnabled } = useFeatureToggle('photo_galleries');
// Menu items conditionally rendered based on flag
```

### 3. API Protection
All gallery API methods check feature status:
```typescript
await requirePhotoGalleriesFeature(); // Throws if disabled
```

### 4. Graceful Degradation
- Feature checks are cached for 5 minutes
- If feature check fails, defaults to disabled
- Existing data is preserved when disabled
- Re-enabling restores full functionality

## Testing the Feature Toggle

### Test Scenario 1: Disable Feature
1. Run the disable SQL above
2. Clear browser cache
3. Refresh the page
4. Verify:
   - Media Gallery menu item is hidden
   - `/admin/media` returns 404
   - `/galleries` returns 404
   - Gallery APIs return error

### Test Scenario 2: Enable Feature
1. Run the enable SQL above
2. Clear browser cache
3. Refresh the page
4. Verify:
   - Media Gallery menu item appears
   - `/admin/media` is accessible
   - `/galleries` loads properly
   - Gallery APIs work normally

### Test Scenario 3: User Experience
1. As a regular user with galleries
2. Admin disables the feature
3. User's galleries are preserved but inaccessible
4. Admin re-enables the feature
5. User's galleries are accessible again

## Troubleshooting

### Feature Not Toggling
1. **Clear cache**: The feature state is cached for 5 minutes
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Check database**: Verify the toggle exists
   ```sql
   SELECT * FROM feature_toggles WHERE feature_key = 'photo_galleries';
   ```

3. **Force refresh**: Hard refresh the browser (Cmd+Shift+R)

### API Still Accessible When Disabled
- Check that all API methods have `await requirePhotoGalleriesFeature()`
- Verify the feature_toggles table has the correct value
- Check for any client-side caching

### Menu Item Not Hiding
- Ensure you're using the latest AdminLayout component
- Check that useFeatureToggle hook is imported
- Verify the feature key matches exactly: `photo_galleries`

## Benefits of Feature Toggle Integration

1. **Risk Mitigation**: Can quickly disable if issues arise
2. **Gradual Rollout**: Enable for specific users/roles first
3. **A/B Testing**: Test gallery features with subset of users
4. **Performance**: Disable heavy features if needed
5. **Compliance**: Quickly disable for legal/compliance reasons
6. **Development**: Test other features without gallery interference

## Future Enhancements

Consider adding:
- Role-based feature access (enable only for premium users)
- Percentage rollout (enable for X% of users)
- Time-based toggles (enable during specific hours)
- Geographic toggles (enable for specific regions)
- Configuration options (adjust limits via toggle config)

## Summary

The photo galleries feature is now fully integrated with the feature toggle system. It can be enabled or disabled at any time through the database without requiring code changes. The system gracefully handles the toggle state, ensuring no errors occur when the feature is disabled, and all functionality is restored when re-enabled.