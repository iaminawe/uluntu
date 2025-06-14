# Profile Onboarding Integration Guide

This guide explains how to integrate the new privacy-first profile onboarding system into your Nelson Tech application.

## Overview

The onboarding system ensures that:
1. **New users start with private profiles** (draft status)
2. **Profile completion is tracked** and users are prompted to fill missing information
3. **Privacy controls are prominent** and easy to understand
4. **Users can opt-in to public visibility** rather than being public by default

## Key Components

### 1. Database Changes
- **Migration**: `20250614_privacy_first_onboarding.sql`
- **New default**: User profiles are created with `status = 'draft'` (private)
- **Privacy-first**: Users must explicitly choose to be public

### 2. Core Hooks

#### `useProfileCompletion(member)`
Tracks profile completion status and missing fields.

```typescript
const { isComplete, completionPercentage, requiredFields, suggestedFields } = useProfileCompletion(member);
```

#### `useProfilePrivacy(member)`
Manages profile privacy settings and visibility controls.

```typescript
const { currentSettings, togglePublicVisibility, setProfilePrivate, setProfilePublic } = useProfilePrivacy(member);
```

#### `useOnboardingStatus()`
Provides onboarding status without rendering components.

```typescript
const { needsOnboarding, profileComplete, shouldShowPrompt } = useOnboardingStatus();
```

### 3. UI Components

#### `ProfileOnboarding`
The main onboarding flow component with three steps:
1. **Welcome**: Shows completion status and missing fields
2. **Privacy**: Lets users choose public/private visibility
3. **Complete**: Confirmation and next steps

#### `OnboardingGuard`
Wraps your app and shows onboarding for incomplete profiles.

#### `ProfileCompletionPrompt`
Shows completion prompts on pages (dashboard, etc.)

#### `ProfilePrivacySettings`
Privacy controls for the profile edit page.

## Integration Steps

### Step 1: Apply Database Migration

Run the migration to set new profiles as private by default:

```bash
supabase db reset  # If in development
# OR
supabase db push   # If in production
```

### Step 2: Add Onboarding Guard (Optional)

Wrap your main app with the onboarding guard to show onboarding automatically:

```typescript
// App.tsx
import { OnboardingGuard } from './components/OnboardingGuard';

function App() {
  return (
    <OnboardingGuard>
      <Router>
        {/* Your existing app routes */}
      </Router>
    </OnboardingGuard>
  );
}
```

### Step 3: Add Profile Privacy Settings

Update your profile edit page to include privacy controls:

```typescript
// ProfileEditPage.tsx
import { ProfilePrivacySettings } from '../components/ProfilePrivacy';
import { useCurrentMember } from '../hooks/useCurrentMember';

export function ProfileEditPage() {
  const { data: member } = useCurrentMember();
  
  return (
    <form>
      {/* Existing form sections */}
      
      <hr />
      
      <ProfilePrivacySettings 
        member={member}
        className="!shadow-none !border-0 !p-0 !bg-transparent"
      />
    </form>
  );
}
```

### Step 4: Add Completion Prompts

Show profile completion prompts on your dashboard or homepage:

```typescript
// Dashboard.tsx
import { ProfileCompletionPrompt, ProfileCompletionBanner } from '../components/ProfilePrompt';

export function Dashboard() {
  const [showPrompt, setShowPrompt] = useState(true);
  
  return (
    <div>
      {/* Optional: Top banner */}
      <ProfileCompletionBanner onDismiss={() => setShowPrompt(false)} />
      
      <div className="grid gap-6">
        {/* Profile completion card */}
        {showPrompt && (
          <ProfileCompletionPrompt 
            onDismiss={() => setShowPrompt(false)}
            compact={false}
          />
        )}
        
        {/* Your existing dashboard content */}
      </div>
    </div>
  );
}
```

### Step 5: Manual Onboarding Trigger

Add a "Getting Started" or "Complete Profile" button:

```typescript
// Header.tsx or Settings.tsx
import { useOnboardingTrigger } from '../components/OnboardingGuard';

export function UserMenu() {
  const { triggerOnboarding } = useOnboardingTrigger();
  
  return (
    <div>
      <button onClick={triggerOnboarding}>
        Complete Profile Setup
      </button>
    </div>
  );
}
```

## Configuration Options

### Onboarding Requirements

Customize what fields are required vs suggested:

```typescript
// hooks/useProfileCompletion.ts
const REQUIRED_FIELDS = ['name', 'bio', 'image'] as const;
const SUGGESTED_FIELDS = ['title', 'location', 'intro', 'skills'] as const;
```

### Privacy Defaults

The system now defaults to private profiles, but you can customize:

```sql
-- In your migration
VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New Member'), 'draft')
-- Change 'draft' to 'published' if you want public by default
```

### Onboarding Trigger Conditions

Customize when onboarding should show:

```typescript
// hooks/useProfileCompletion.ts
export function shouldShowOnboarding(member: Member | null | undefined): boolean {
  if (!member) return true;
  
  const { isComplete, completionPercentage } = useProfileCompletion(member);
  
  // Customize these thresholds
  return !isComplete || completionPercentage < 60;
}
```

## Privacy Features

### What's Private by Default
- New user profiles have `status = 'draft'`
- Not visible in the community directory
- Not shown in search results
- Can still join groups and attend events

### What Users Can Do
- **Toggle visibility** with a simple switch
- **See privacy status** clearly indicated
- **Understand implications** of public vs private
- **Change settings anytime** in profile edit

### Privacy Status Indicators
- 🔒 **Private**: Hidden from directory
- 👁️ **Public**: Visible in directory
- ⏳ **Pending**: Under review (if needed)
- 📦 **Archived**: Not visible

## Testing

### Manual Testing Checklist
1. ✅ New user registers → profile is private by default
2. ✅ Onboarding shows for incomplete profiles
3. ✅ Privacy toggle works in onboarding and profile edit
4. ✅ Private profiles don't appear in directory
5. ✅ Public profiles appear in directory
6. ✅ Completion prompts show appropriate missing fields
7. ✅ Users can skip onboarding if needed

### Unit Tests
Run the included tests:

```bash
npm test ProfileOnboarding
npm test useProfileCompletion
npm test useProfilePrivacy
```

## Best Practices

### User Experience
- **Progressive disclosure**: Don't overwhelm with all options at once
- **Clear privacy implications**: Explain what public/private means
- **Easy to change**: Allow users to modify settings anytime
- **Contextual prompts**: Show completion reminders at appropriate times

### Privacy
- **Opt-in by default**: Private first, public by choice
- **Clear controls**: Obvious privacy settings
- **Transparent**: Users understand their visibility status
- **Respectful**: Easy to dismiss prompts if not wanted

### Development
- **Modular components**: Easy to customize and extend
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Responsive**: Works on all device sizes
- **Performant**: Minimal re-renders and API calls

## Troubleshooting

### Common Issues

**Onboarding not showing**
- Check localStorage for 'onboarding_completed' or 'onboarding_skipped'
- Verify profile completion logic
- Ensure OnboardingGuard is properly wrapped

**Privacy toggle not working**
- Verify membersApi.update() is working
- Check RLS policies for members table
- Ensure user has permission to update their profile

**Migration issues**
- Make sure the migration ran successfully
- Verify the trigger function was updated
- Check that new profiles have 'draft' status

### Debug Information

```typescript
// Add to any component for debugging
const { data: member } = useCurrentMember();
const completion = useProfileCompletion(member);
const privacy = useProfilePrivacy(member);

console.log('Member:', member);
console.log('Completion:', completion);
console.log('Privacy:', privacy);
```

## Future Enhancements

Potential improvements to consider:

1. **Profile completion gamification** - badges, progress rewards
2. **Guided tour** - interactive walkthrough of features
3. **Profile suggestions** - AI-powered field recommendations
4. **Social proof** - "X% of members have completed profiles"
5. **Admin analytics** - track onboarding completion rates
6. **A/B testing** - different onboarding flows
7. **Progressive profile building** - spread completion over time

This onboarding system provides a solid foundation for privacy-first user experience while encouraging profile completion.