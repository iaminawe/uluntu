/**
 * @deprecated This file has been split into focused modules for better maintainability.
 *
 * Please update your imports to use the new modular structure:
 *
 * OLD:
 * ```typescript
 * import { useConversations, useMessages } from '@/hooks/useMessagingQueries';
 * ```
 *
 * NEW:
 * ```typescript
 * import { useConversations, useMessages } from '@/hooks/messaging';
 * ```
 *
 * This file will be removed in a future version.
 * All exports are still available for backwards compatibility.
 */

// Re-export everything from the new modular structure
export * from './messaging';
export { messagingQueryKeys } from './messaging';

// Note: The original 932-line file has been split into:
// - /src/hooks/messaging/types.ts - Type definitions
// - /src/hooks/messaging/useConversations.ts - Conversation hooks
// - /src/hooks/messaging/useMessages.ts - Message hooks
// - /src/hooks/messaging/useBlockedUsers.ts - Blocked user hooks
// - /src/hooks/messaging/utils.ts - Cache management utilities
// - /src/hooks/messaging/index.ts - Barrel export
