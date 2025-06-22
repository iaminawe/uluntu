# Onboarding System Documentation

## Overview

The Nelson Tech Community onboarding system provides a privacy-first, user-friendly way for new members to complete their profiles and join the community. The system features a 5-step wizard that guides users through profile creation while maintaining privacy by default.

## Key Features

### Privacy by Default
- New members are created with `status='draft'` 
- Profiles remain private until explicitly published
- Members control when their profile appears in the directory
- Granular privacy settings for different information

### 5-Step Onboarding Wizard
1. **Welcome** - Introduction to the community and expectations
2. **Professional Information** - Bio, skills, employment status
3. **Company Association** - Link to existing company or create new
4. **Privacy Settings** - Control profile visibility and sharing
5. **Community Engagement** - Interests, groups, and preferences

### Automatic Integration
- Signup flow automatically redirects to onboarding
- Database trigger creates member profile on user registration
- User automatically assigned 'authenticated' role
- Progress auto-saved to prevent data loss

## Technical Implementation

### Database Schema
```sql
-- Members table includes onboarding fields
ALTER TABLE members ADD COLUMN
  status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'suspended'
  onboarding_completed_at TIMESTAMP,
  onboarding_current_step INTEGER DEFAULT 1,
  onboarding_skipped_steps JSONB DEFAULT '[]',
  profile_completion_percentage INTEGER DEFAULT 0,
  privacy_settings JSONB;
```

### Redux State Management
```typescript
// Onboarding state structure
interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  formData: {
    professional: ProfessionalInfo;
    company: CompanyAssociation;
    privacy: PrivacySettings;
    engagement: CommunityEngagement;
  };
  completionPercentage: number;
  isCompleted: boolean;
}
```

### Component Architecture
- `OnboardingWizard` - Main container component
- `OnboardingLayout` - Layout with progress indicator
- Step components for each wizard step
- Shared components for progress tracking

### Privacy Implementation
- Directory queries filter by `status='published'`
- Profile owners can always view their own profile
- Admins can view all profiles
- Publishing/unpublishing functions with RLS

## User Flow

### New User Journey
1. User signs up with email/password
2. Database trigger creates member profile (status='draft')
3. User is redirected to `/onboarding/welcome`
4. User completes 5-step wizard (can skip steps)
5. User chooses to publish profile or keep private
6. Profile appears in directory only if published

### Returning User
- Can access onboarding from profile settings
- Can publish/unpublish profile at any time
- Can update privacy settings
- Progress saved automatically

## API Integration

### Key Endpoints
- `GET /api/onboarding/progress` - Get current progress
- `POST /api/onboarding/progress` - Update progress
- `POST /api/members/publish` - Publish profile
- `POST /api/members/unpublish` - Make profile private

### Privacy Filtering
```typescript
// Only fetch published members for directory
const publicMembers = await supabase
  .from('members')
  .select('*')
  .eq('status', 'published');
```

## Security & Privacy

### Row Level Security (RLS)
- Members can only update their own profiles
- Published profiles viewable by everyone
- Draft profiles only visible to owner and admins
- Trigger ensures proper role assignment

### Data Protection
- Auto-save prevents data loss
- LocalStorage backup for form data
- Graceful error handling
- Session validation

## Configuration

### Environment Variables
- No additional environment variables required
- Uses existing Supabase configuration
- Privacy settings stored in database

### Feature Flags
- Onboarding can be toggled via admin panel
- Individual steps can be made optional
- Custom validation rules per step

## Monitoring & Analytics

### Key Metrics
- Onboarding completion rate
- Average time to complete
- Step abandonment rates
- Profile publishing conversion

### Success Indicators
- 75% completion within 7 days
- 60% publish profiles within 30 days
- <10 minute average completion time
- >80% profile completeness

## Troubleshooting

### Common Issues

#### User stuck on step
- Check `onboarding_current_step` in database
- Verify form validation errors
- Check browser console for errors

#### Profile not appearing in directory
- Verify `status='published'` in database
- Check RLS policies are correct
- Ensure directory queries filter properly

#### Progress not saving
- Check Supabase connection
- Verify user authentication
- Check browser LocalStorage

### Debug Commands
```sql
-- Check user onboarding status
SELECT id, name, status, onboarding_current_step, 
       onboarding_completed_at, profile_completion_percentage
FROM members 
WHERE user_id = 'USER_ID';

-- Manually publish profile
UPDATE members 
SET status = 'published' 
WHERE id = 'MEMBER_ID';
```

## Future Enhancements

### Planned Features
- LinkedIn profile import
- AI-powered bio suggestions
- Video introductions
- Skill verification system
- Mentorship matching

### Integration Opportunities
- Slack onboarding bot
- Email drip campaigns
- Community ambassador program
- Gamification elements

## Support

For issues or questions:
- Check browser console for errors
- Review Redux DevTools for state
- Check Supabase logs for database errors
- Contact admin for manual intervention