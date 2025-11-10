# Conversations System Testing

## Overview
End-to-end testing setup for the conversations/messaging system has been completed.

## Test Components Created

### 1. Browser-Based UI Testing
- **Location**: `/src/components/TestConversations.tsx`
- **Route**: `/test-conversations`
- **Access**: http://localhost:5557/test-conversations (when dev server is running)

### 2. Node.js Script Testing
- **Location**: `/scripts/test-conversations.js`
- **Purpose**: Programmatic testing of conversations API

### 3. Quick Test Script
- **Location**: `/scripts/quick-test-conversations.sh`
- **Purpose**: Quick verification of route accessibility

## Testing Coverage

The test suite covers:

1. **Authentication**
   - User login verification
   - Session management

2. **Member Profile**
   - Profile existence check
   - Profile data validation

3. **Conversations**
   - Fetching conversation list
   - Creating new conversations
   - Retrieving existing conversations

4. **Participants**
   - Adding participants to conversations
   - Checking participant permissions

5. **Messages**
   - Sending messages
   - Retrieving message history
   - Real-time updates (if applicable)

## How to Run Tests

### Browser UI Tests
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the test page:
   ```
   http://localhost:5557/test-conversations
   ```

3. Click "Run Tests" to execute all tests
4. View results in the test interface

### Programmatic Tests
Run the Node.js test script:
```bash
node scripts/test-conversations.js
```

## Fixed Issues

### Column Name Mismatch
- **Problem**: API queries used `notifications_enabled` but database had `notification_settings`
- **Solution**: Updated all API queries and TypeScript types to use `notification_settings`
- **Files Modified**:
  - `/src/features/messaging/api/messagingApi.real.ts`
  - `/src/types/supabase.ts`
  - `/src/features/messaging/types/conversation.ts`

### ID Type Inconsistencies
- **Problem**: Mixed usage of `number` and `string` for IDs
- **Solution**: Standardized to `string` IDs (UUIDs) across the codebase
- **Affected Components**:
  - MarketplaceList
  - CompanyProfile
  - DirectoryList
  - Various detail pages

## Test Results

### Route Accessibility
✅ `/test-conversations` route successfully added and accessible (HTTP 200)

### Development Server
✅ Running on port 5557 without errors

### TypeScript
⚠️ Some unrelated TypeScript errors remain in other components but do not affect conversations functionality

## Next Steps

1. Run the browser-based tests to verify all conversation operations
2. Monitor console for any runtime errors
3. Test with multiple user accounts to verify participant functionality
4. Consider adding automated E2E tests with Playwright or Cypress

## Database Schema Reference

The conversations system uses these main tables:
- `conversations` - Main conversation records
- `conversation_participants` - User participation and settings
- `messages` - Individual messages
- `message_attachments` - File attachments
- `message_reactions` - Emoji reactions
- `message_read_receipts` - Read status tracking

All tables have appropriate RLS policies for security.