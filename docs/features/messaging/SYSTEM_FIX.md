# Messaging System Fix - Foreign Key Constraint Resolution

## Problem Summary

The messaging system was experiencing two critical issues:

1. **Foreign Key Constraint Violation**: `conversations_created_by_fkey` error when creating messages
   - Error: `Key (created_by)=(257de888-bc42-405a-b499-d34634486c7f) is not present in table "users"`
   - Root cause: Database tables referenced `auth.users` but frontend used member IDs

2. **Infinite Recursion Policy Error**: `infinite recursion detected in policy for relation "conversation_participants"`
   - Root cause: Circular references in Row Level Security policies

## Root Cause Analysis

The messaging system had inconsistent foreign key references:
- Some tables referenced `auth.users(id)` 
- Frontend code used member IDs from `members` table
- Policies created circular dependencies causing infinite recursion

## Solution Implemented

### 1. Database Schema Fixes (`20250819000006_fix_messaging_complete.sql`)

**Foreign Key Updates:**
- `conversations.created_by` → now references `members(id)`
- `conversation_participants.user_id` → now references `members(id)`
- `messages.sender_id` → now references `members(id)`
- `message_reactions.user_id` → now references `members(id)`

**Policy Fixes:**
- Removed circular references in conversation_participants policies
- Updated policies to use explicit JOINs with members table
- Fixed infinite recursion by avoiding self-referential queries

**Function Updates:**
- `get_unread_message_count()` → now works with current user's member ID
- `mark_conversation_as_read()` → simplified parameter signature
- `create_direct_conversation()` → already fixed in previous migration

### 2. Frontend API Fixes (`messagingApi.real.ts`)

**Added utility method:**
```typescript
private async getCurrentMemberId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) throw new Error('User does not have a member profile');
  return member.id;
}
```

**Updated all methods to use member IDs:**
- `getConversations()` - uses member ID for participant filtering
- `getConversation()` - checks member participation
- `createConversation()` - uses member ID as creator
- `getMessages()` - verifies member participation
- `sendMessage()` - uses member ID as sender
- `updateMessage()` - verifies member ownership
- `deleteMessage()` - verifies member ownership
- `markConversationAsRead()` - uses updated function signature
- `getUnreadCount()` - uses updated function signature

## How to Apply the Fix

### Step 1: Apply Database Migration

Run the provided script:
```bash
./scripts/fix-messaging-db.sh
```

Or manually apply the migration:
```bash
# If you have Supabase CLI access
npx supabase migration up --linked

# Or apply SQL directly in Supabase dashboard
# Copy contents of: supabase/migrations/20250819000006_fix_messaging_complete.sql
```

### Step 2: Verify Frontend Changes

The frontend changes have been applied to `src/features/messaging/api/messagingApi.real.ts`. 

**Key changes:**
- All user ID references now use member IDs
- Added `getCurrentMemberId()` helper method
- Updated function call signatures to match database changes

### Step 3: Test Messaging Functionality

After applying the database migration:

1. **Test conversation creation:**
   - Try creating a new direct message
   - Verify no foreign key constraint errors

2. **Test message sending:**
   - Send messages in existing conversations
   - Verify messages appear correctly

3. **Test conversation loading:**
   - Check that conversations list loads without infinite recursion
   - Verify message threads display properly

## Expected Behavior After Fix

✅ **Conversations create successfully**
✅ **Messages send without foreign key errors**
✅ **Conversation lists load without infinite recursion**
✅ **Member profiles display correctly in messages**
✅ **Unread counts work properly**

## Rollback Plan (if needed)

If issues arise, you can rollback by:

1. **Database rollback:**
   ```bash
   npx supabase migration rollback --linked
   ```

2. **Frontend rollback:**
   - Revert changes in `messagingApi.real.ts`
   - Use `git checkout HEAD~1 -- src/features/messaging/api/messagingApi.real.ts`

## Files Modified

### Database
- `supabase/migrations/20250819000006_fix_messaging_complete.sql` (new)
- `scripts/fix-messaging-db.sh` (new)

### Frontend
- `src/features/messaging/api/messagingApi.real.ts` (modified)

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Can create new conversations without errors
- [ ] Can send messages in conversations
- [ ] Conversations list loads without infinite recursion
- [ ] Message threads display correctly
- [ ] Unread counts work properly
- [ ] Member profiles show in message senders

---

**Note**: This fix ensures the messaging system uses consistent member ID references throughout the database and frontend, resolving both the foreign key constraint and infinite recursion issues.