# RLS (Row Level Security) Fix Documentation

## Overview

This document outlines the comprehensive solution implemented to fix RLS issues affecting conversation updates and operations in the messaging system. The solution addresses 406 (Not Acceptable) errors, "JSON object requested, multiple (or no) rows returned" errors, and RLS blocking conversation updates.

## Problem Analysis

### Core Issues Identified

1. **406 (Not Acceptable) Errors**: PATCH requests returning 406 due to multiple or no rows returned
2. **RLS Policy Conflicts**: Row Level Security policies blocking legitimate conversation updates
3. **Participant Verification**: Complex participant verification causing recursive policy checks
4. **Error Handling**: Poor error messages and lack of fallback strategies

### Root Causes

- **Complex RLS Policies**: Recursive policy checks causing infinite loops
- **Multiple Row Returns**: Queries returning multiple rows when single row expected
- **Permission Verification**: Inefficient participant checking causing performance issues
- **Fallback Strategies**: Lack of graceful degradation when operations are blocked

## Solution Architecture

### 1. Database Functions (Security Definer)

#### `update_conversation_title(conversation_id UUID, new_title TEXT)`

**Purpose**: Securely update conversation titles bypassing RLS restrictions

**Features**:
- Participant verification before update
- Creator permission checking
- Atomic operation with proper error handling
- Returns updated conversation record

**Usage**:
```sql
SELECT * FROM update_conversation_title('conversation-uuid', 'New Title');
```

#### `get_conversation_secure(conversation_id UUID)`

**Purpose**: Securely retrieve conversation details with access verification

**Features**:
- Built-in participant access checking
- Bypasses complex RLS policies
- Returns conversation data only if user has access
- Throws descriptive errors for unauthorized access

**Usage**:
```sql
SELECT * FROM get_conversation_secure('conversation-uuid');
```

#### `check_conversation_participant(conversation_id UUID, member_id UUID DEFAULT NULL)`

**Purpose**: Verify participant status and permissions for a conversation

**Returns**:
```json
{
  "is_participant": boolean,
  "is_creator": boolean,
  "role": string,
  "joined_at": timestamp,
  "left_at": timestamp,
  "conversation_id": uuid,
  "member_id": uuid,
  "can_update": boolean
}
```

**Features**:
- Comprehensive participant information
- Role-based permission checking
- Creator verification
- Update permission calculation

### 2. Updated RLS Policies

#### Conversations Table Policies

- **`conversations_select_open`**: Allows viewing conversations where user is participant or creator
- **`conversations_insert_members`**: Only authenticated members can create conversations
- **`conversations_update_secure`**: Only admins, moderators, and creators can update

#### Conversation Participants Table Policies

- **`participants_select_own`**: Users can see participants of conversations they're in
- **`participants_insert_admin`**: Only admins and creators can add participants
- **`participants_update_own`**: Users can update their own participation status

#### Messages Table Policies

- **`messages_select_participants`**: Users can see messages in conversations they participate in
- **`messages_insert_participants`**: Users can send messages to conversations they participate in
- **`messages_update_own`**: Users can edit their own messages

### 3. API Layer Improvements

#### Enhanced Error Handling

```typescript
// Primary approach: Use secure database function
const { data, error } = await supabase
  .rpc('update_conversation_title', {
    conversation_id: id,
    new_title: updates.title
  });

// Fallback 1: Participant verification + direct update
if (error) {
  const participantInfo = await this.checkParticipantStatus(id);
  if (!participantInfo.canUpdate) {
    throw new Error('You do not have permission to update this conversation');
  }
  return await this.updateConversationFallback(id, updates);
}
```

#### 406 Error Mitigation

```typescript
// Try single() first
const { data, error } = await supabase
  .from('conversations')
  .update(updateData)
  .eq('id', id)
  .select()
  .single();

if (error?.code === 'PGRST106') {
  // Fallback: Try without .single() to avoid 406 errors
  const { data: arrayData, error: arrayError } = await supabase
    .from('conversations')
    .update(updateData)
    .eq('id', id)
    .select();
    
  return arrayData?.[0];
}
```

#### Participant Status Checking

```typescript
private async checkParticipantStatus(conversationId: string): Promise<{
  isParticipant: boolean;
  isCreator: boolean;
  role: string | null;
  canUpdate: boolean;
}> {
  const { data, error } = await supabase
    .rpc('check_conversation_participant', {
      conversation_id: conversationId
    });

  const info = data || {};
  return {
    isParticipant: info.is_participant || false,
    isCreator: info.is_creator || false,
    role: info.role || null,
    canUpdate: (info.is_participant && ['admin', 'moderator'].includes(info.role)) || info.is_creator
  };
}
```

### 4. React Query Integration

#### Enhanced Retry Logic

```typescript
retry: (failureCount, error) => {
  // Don't retry permission errors
  if (error?.message?.includes('permission')) return false;
  
  // Don't retry RLS policy errors
  if (error?.code === '42501') return false;
  
  // Retry 406 errors once (might be transient)
  if (error?.code === 'PGRST106' && failureCount < 1) return true;
  
  return failureCount < 2;
}
```

#### User-Friendly Error Messages

```typescript
onError: (error) => {
  if (error.message?.includes('permission')) {
    error.message = 'You do not have permission to update this conversation';
  } else if (error.code === '42501') {
    error.message = 'Unable to update conversation due to security restrictions';
  } else if (error.code === 'PGRST106') {
    error.message = 'Conversation update failed due to a database issue';
  }
}
```

## Implementation Guide

### Step 1: Deploy Database Migration

```bash
# Apply the RLS fix migration
supabase db push
```

The migration file: `20250822000001_fix_conversation_rls_complete.sql`

### Step 2: Verify Database Functions

```sql
-- Test participant checking
SELECT check_conversation_participant('your-conversation-id');

-- Test secure conversation retrieval
SELECT get_conversation_secure('your-conversation-id');

-- Test title update
SELECT update_conversation_title('your-conversation-id', 'Test Title');
```

### Step 3: Update Frontend Code

The updated files:
- `src/features/messaging/api/messagingApi.real.ts`
- `src/hooks/useMessagingQueries.ts`

### Step 4: Test Operations

1. **Conversation Updates**: Test title updates with various user roles
2. **Permission Verification**: Ensure unauthorized users cannot update
3. **Error Handling**: Verify user-friendly error messages
4. **Fallback Strategies**: Test behavior when database functions fail

## Error Handling Matrix

| Error Type | Code | User Message | Retry Strategy |
|------------|------|--------------|----------------|
| Permission Denied | 42501 | "Unable to update due to security restrictions" | No retry |
| Not Authorized | Custom | "You do not have permission" | No retry |
| 406 Multiple Rows | PGRST106 | "Update failed due to database issue" | Retry once |
| Not Found | PGRST116 | "Conversation not found" | No retry |
| Network Error | Various | Original error | Retry with backoff |

## Monitoring and Debugging

### Database Function Logs

```sql
-- Check function execution logs
SELECT * FROM pg_stat_user_functions 
WHERE funcname IN ('update_conversation_title', 'get_conversation_secure', 'check_conversation_participant');
```

### Application Logs

Look for these log patterns:
- `"Database function update failed"` - Function execution issues
- `"406 error detected"` - Multiple row returns
- `"Fallback update failed"` - Secondary strategy failures
- `"Participant check failed"` - Permission verification issues

### Performance Monitoring

- Function execution times
- RLS policy evaluation times  
- Retry frequency and success rates
- Error distribution by type

## Security Considerations

### Database Functions Security

- All functions use `SECURITY DEFINER` to bypass RLS
- Participant verification is performed within functions
- No direct table access without authorization
- Comprehensive input validation

### RLS Policy Security

- Policies use view-based access control
- No recursive function calls
- Clear separation of read/write permissions
- Admin-only update capabilities

### API Security

- Multiple verification layers
- Fallback strategies maintain security
- Error messages don't leak sensitive information
- Audit logging for all operations

## Troubleshooting

### Common Issues

1. **Function Not Found**: Ensure migration was applied successfully
2. **Permission Denied**: Check user authentication and member profile
3. **Still Getting 406 Errors**: Verify RLS policies are applied correctly
4. **Slow Performance**: Check database function execution plans

### Debug Commands

```sql
-- Check if functions exist
\df update_conversation_title
\df get_conversation_secure
\df check_conversation_participant

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'conversations';

-- Check view exists
\dv user_conversation_access
\dv conversation_operation_status
```

## Future Improvements

1. **Batch Operations**: Extend functions to handle multiple conversation updates
2. **Audit Logging**: Add comprehensive operation logging
3. **Performance Optimization**: Index optimization for participant queries
4. **Real-time Updates**: WebSocket integration for live conversation updates
5. **Advanced Permissions**: Granular role-based permissions

## Migration Rollback

If issues occur, rollback steps:

1. **Disable RLS temporarily**:
```sql
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

2. **Drop new functions**:
```sql
DROP FUNCTION IF EXISTS update_conversation_title(UUID, TEXT);
DROP FUNCTION IF EXISTS get_conversation_secure(UUID);
DROP FUNCTION IF EXISTS check_conversation_participant(UUID, UUID);
```

3. **Restore previous RLS policies** (if backup available)

4. **Re-enable RLS with previous policies**

## Support and Maintenance

### Regular Monitoring

- Weekly review of error logs
- Monthly performance analysis
- Quarterly security audit
- Function usage statistics

### Documentation Updates

This document should be updated when:
- New functions are added
- RLS policies are modified
- Error handling is improved
- Performance optimizations are made

### Contact Information

For issues related to this RLS fix:
- System Architecture Team
- Database Administration Team
- Security Team