# API Documentation

## Overview

The Kootenay Tech Community platform uses a modular API architecture with TypeScript for type safety and Supabase as the backend. All API modules follow consistent patterns for data fetching, error handling, and type conversions.

## Base Configuration

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

### Error Handling
```typescript
export function handleSupabaseError(error: any, context: string): void {
  console.error(`Error ${context}:`, error);
  // Additional error tracking can be added here
}
```

## API Modules

### Administrative APIs (`/api/admin/`)

The administrative API layer provides comprehensive platform management capabilities with strict superadmin access control.

#### Features API (`/api/admin/features.ts`)

##### Types
```typescript
interface AdminFeature {
  id: string;
  feature_key: string;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface FeatureTranslation {
  id: string;
  feature_id: string;
  language_code: string;
  translations: Record<string, string>;
  created_at: string;
}
```

##### Methods

###### `getFeatures()`
Fetches all feature flags with their configurations.

```typescript
const features = await adminFeaturesApi.getFeatures();
```

**Returns:** `Promise<AdminFeature[]>`

###### `toggleFeature(featureKey, enabled)`
Enables or disables a specific feature.

```typescript
const success = await adminFeaturesApi.toggleFeature('marketplace', true);
```

**Returns:** `Promise<boolean>`

###### `updateFeatureConfig(featureKey, config)`
Updates the configuration for a feature.

```typescript
const success = await adminFeaturesApi.updateFeatureConfig('events', {
  maxAttendeesDefault: 100,
  requireApproval: false
});
```

**Returns:** `Promise<boolean>`

###### `isFeatureEnabled(featureKey)`
Checks if a feature is currently enabled.

```typescript
const isEnabled = await adminFeaturesApi.isFeatureEnabled('groups');
```

**Returns:** `Promise<boolean>`

###### `getFeatureTranslations(featureId)`
Fetches all translations for a specific feature.

```typescript
const translations = await adminFeaturesApi.getFeatureTranslations('feature-uuid');
```

**Returns:** `Promise<FeatureTranslation[]>`

###### `upsertFeatureTranslation(featureId, languageCode, translations)`
Creates or updates translations for a feature in a specific language.

```typescript
const success = await adminFeaturesApi.upsertFeatureTranslation(
  'feature-uuid',
  'es',
  {
    title: 'Eventos',
    description: 'Gestionar eventos de la comunidad',
    createButton: 'Crear Evento'
  }
);
```

**Returns:** `Promise<boolean>`

#### Roles API (`/api/admin/roles.ts`)

##### Types
```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  is_system: boolean;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
  role: Role;
}
```

##### Methods

###### `getRoles()`
Fetches all available roles.

```typescript
const roles = await adminRolesApi.getRoles();
```

**Returns:** `Promise<Role[]>`

###### `createRole(roleData)`
Creates a new role with specified permissions.

```typescript
const newRole = await adminRolesApi.createRole({
  name: 'Event Manager',
  description: 'Can manage events and registrations',
  permissions: {
    events: ['create', 'read', 'update', 'delete'],
    members: ['read']
  }
});
```

**Returns:** `Promise<Role | null>`

###### `updateRole(id, updates)`
Updates an existing role (system roles protected).

```typescript
const updated = await adminRolesApi.updateRole('role-uuid', {
  description: 'Updated role description',
  permissions: { events: ['read', 'update'] }
});
```

**Returns:** `Promise<Role | null>`

###### `deleteRole(id)`
Deletes a role (system roles protected).

```typescript
const success = await adminRolesApi.deleteRole('role-uuid');
```

**Returns:** `Promise<boolean>`

###### `assignRole(userId, roleId)`
Assigns a role to a user.

```typescript
const success = await adminRolesApi.assignRole('user-uuid', 'role-uuid');
```

**Returns:** `Promise<boolean>`

###### `removeRole(userId, roleId)`
Removes a role from a user.

```typescript
const success = await adminRolesApi.removeRole('user-uuid', 'role-uuid');
```

**Returns:** `Promise<boolean>`

###### `getUserRoles(userId)`
Fetches all roles assigned to a specific user.

```typescript
const userRoles = await adminRolesApi.getUserRoles('user-uuid');
```

**Returns:** `Promise<UserRole[]>`

###### `checkPermission(userId, resource, action)`
Checks if a user has permission for a specific action on a resource.

```typescript
const hasPermission = await adminRolesApi.checkPermission(
  'user-uuid',
  'events',
  'create'
);
```

**Returns:** `Promise<boolean>`

#### Moderation API (`/api/admin/moderation.ts`)

##### Types
```typescript
interface ModerationItem {
  id: string;
  entity_type: string;
  entity_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  reviewed_by?: string;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
}
```

##### Methods

###### `getModerationQueue(filters?)`
Fetches items in the moderation queue with optional filtering.

```typescript
const queue = await adminModerationApi.getModerationQueue({
  status: 'pending',
  entityType: 'events',
  limit: 20,
  offset: 0
});
```

**Returns:** `Promise<{ data: ModerationItem[], count: number }>`

###### `approveContent(itemId, notes?)`
Approves a moderation item.

```typescript
const success = await adminModerationApi.approveContent(
  'moderation-uuid',
  'Content looks good'
);
```

**Returns:** `Promise<boolean>`

###### `rejectContent(itemId, notes)`
Rejects a moderation item with required notes.

```typescript
const success = await adminModerationApi.rejectContent(
  'moderation-uuid',
  'Content violates community guidelines'
);
```

**Returns:** `Promise<boolean>`

###### `getContentDetails(entityType, entityId)`
Fetches the actual content for review.

```typescript
const content = await adminModerationApi.getContentDetails('events', 'event-uuid');
```

**Returns:** `Promise<any>`

#### Stats API (`/api/admin/stats.ts`)

##### Types
```typescript
interface AdminStats {
  totalMembers: number;
  totalCompanies: number;
  totalGroups: number;
  totalEvents: number;
  pendingModeration: number;
  activeUsers: number;
}

interface ActivityStat {
  date: string;
  signups: number;
  events_created: number;
  listings_created: number;
}
```

##### Methods

###### `getOverviewStats()`
Fetches platform overview statistics.

```typescript
const stats = await adminStatsApi.getOverviewStats();
```

**Returns:** `Promise<AdminStats>`

###### `getActivityStats(dateRange?)`
Fetches activity statistics over time.

```typescript
const activity = await adminStatsApi.getActivityStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});
```

**Returns:** `Promise<ActivityStat[]>`

#### Audit API (`/api/admin/audit.ts`)

##### Types
```typescript
interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  changes?: Record<string, any>;
  created_at: string;
  admin?: { email: string };
}

interface AuditFilters {
  adminId?: string;
  entityType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
```

##### Methods

###### `getAuditLogs(filters?)`
Fetches audit log entries with optional filtering.

```typescript
const logs = await adminAuditApi.getAuditLogs({
  action: 'create',
  entityType: 'events',
  startDate: new Date('2024-01-01'),
  limit: 50
});
```

**Returns:** `Promise<{ data: AuditLogEntry[], count: number }>`

###### `exportAuditLogs(filters?)`
Exports audit logs as CSV format.

```typescript
const csv = await adminAuditApi.exportAuditLogs({
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});
```

**Returns:** `Promise<string>`

### Events API (`/api/eventsApi.ts`)

#### Types
```typescript
interface EventInput {
  title: string;
  description?: string;
  date: string; // ISO string
  endDate?: string;
  location: string;
  address?: string;
  type: 'in-person' | 'online' | 'hybrid';
  url?: string;
  organizerId: string;
  groupId?: string;
  maxAttendees?: number;
  status?: ContentStatus;
  featured?: boolean;
}
```

#### Methods

##### `getAll(filters?)`
Fetches all published events with optional filtering.

```typescript
const events = await eventsApi.getAll({
  search: 'tech',
  types: ['online', 'hybrid'],
  dateRange: 'upcoming'
});
```

**Parameters:**
- `search` (string): Search in title and description
- `types` (string[]): Filter by event type
- `dateRange` (string): 'upcoming' | 'month' | 'three-months' | 'all'

**Returns:** `Promise<Event[]>`

##### `getById(id)`
Fetches a single event with full details including sessions and attendees.

```typescript
const event = await eventsApi.getById('event-uuid');
```

**Returns:** `Promise<Event | null>`

##### `registerForEvent(eventId, memberId)`
Registers a member for an event.

```typescript
const success = await eventsApi.registerForEvent('event-uuid', 'member-uuid');
```

**Returns:** `Promise<boolean>`

##### `unregisterFromEvent(eventId, memberId)`
Removes a member's registration from an event.

```typescript
const success = await eventsApi.unregisterFromEvent('event-uuid', 'member-uuid');
```

**Returns:** `Promise<boolean>`

##### `getEventAttendees(eventId)`
Fetches all attendees for an event.

```typescript
const attendees = await eventsApi.getEventAttendees('event-uuid');
```

**Returns:** `Promise<EventAttendee[]>`

##### `updateAttendeeStatus(eventId, memberId, status)`
Updates an attendee's registration status (for organizers).

```typescript
const success = await eventsApi.updateAttendeeStatus(
  'event-uuid',
  'member-uuid',
  'confirmed'
);
```

**Returns:** `Promise<boolean>`

### Marketplace API (`/api/marketplaceApi.ts`)

#### Types
```typescript
interface MarketplaceItemInput {
  title: string;
  description?: string;
  type: 'product' | 'service' | 'equipment' | 'event';
  price?: number;
  condition?: string;
  images?: string[];
  location?: string;
  tags?: string[];
  sellerId: string;
  status?: ContentStatus;
  featured?: boolean;
  // Contact fields
  contactEmail?: string;
  contactPhone?: string;
  contactMethod?: 'email' | 'phone' | 'both';
  showContactInfo?: boolean;
}
```

#### Methods

##### `getAll(filters?)`
Fetches marketplace listings with optional filtering.

```typescript
const listings = await marketplaceApi.getAll({
  search: 'laptop',
  type: 'product',
  condition: 'like-new',
  featured: true
});
```

**Parameters:**
- `search` (string): Search in title and description
- `type` (string): 'product' | 'service' | 'equipment' | 'event'
- `condition` (string): Item condition
- `featured` (boolean): Only featured items
- `seller_id` (string): Filter by seller

**Returns:** `Promise<MarketplaceItem[]>`

##### `getById(id)`
Fetches a single marketplace listing with seller details.

```typescript
const listing = await marketplaceApi.getById('listing-uuid');
```

**Returns:** `Promise<MarketplaceItem | null>`

##### `create(itemData)`
Creates a new marketplace listing.

```typescript
const newListing = await marketplaceApi.create({
  title: 'Gaming Laptop',
  description: 'High-performance laptop...',
  price: 1200,
  type: 'product',
  condition: 'like-new',
  contactEmail: 'seller@example.com',
  contactMethod: 'email',
  sellerId: 'member-uuid'
});
```

**Returns:** `Promise<MarketplaceItem | null>`

##### `update(id, itemData)`
Updates an existing marketplace listing.

```typescript
const updated = await marketplaceApi.update('listing-uuid', {
  price: 1000,
  status: 'sold'
});
```

**Returns:** `Promise<MarketplaceItem | null>`

##### `delete(id)`
Deletes a marketplace listing.

```typescript
const success = await marketplaceApi.delete('listing-uuid');
```

**Returns:** `Promise<boolean>`

### Members API (`/api/membersApi.ts`)

#### Types
```typescript
interface MemberInput {
  name: string;
  title?: string;
  bio?: string;
  location?: string;
  image?: string;
  social?: { website?: string };
  intro?: string;
  status?: ContentStatus;
  featured?: boolean;
}
```

#### Methods

##### `getAll(filters?)`
Fetches all published members with optional filtering.

```typescript
const members = await membersApi.getAll({
  search: 'developer',
  skills: ['React', 'TypeScript']
});
```

**Parameters:**
- `search` (string): Search in name, title, and bio
- `skills` (string[]): Filter by skills

**Returns:** `Promise<Member[]>`

##### `getById(id)`
Fetches a single member with full profile details.

```typescript
const member = await membersApi.getById('member-uuid');
```

**Returns:** `Promise<Member | null>`

##### `getByUserId(userId)`
Fetches a member profile by their auth user ID.

```typescript
const member = await membersApi.getByUserId('auth-user-uuid');
```

**Returns:** `Promise<Member | null>`

##### `getByCompany(companyId)`
Fetches all members associated with a company.

```typescript
const employees = await membersApi.getByCompany('company-uuid');
```

**Returns:** `Promise<Member[]>`

##### `create(memberData)`
Creates a new member profile.

```typescript
const newMember = await membersApi.create({
  name: 'John Doe',
  title: 'Software Developer',
  bio: 'Passionate about web development...',
  location: 'Nelson, BC'
});
```

**Returns:** `Promise<Member | null>`

##### `update(id, memberData)`
Updates an existing member profile.

```typescript
const updated = await membersApi.update('member-uuid', {
  title: 'Senior Software Developer',
  skills: ['React', 'Node.js', 'TypeScript']
});
```

**Returns:** `Promise<Member | null>`

### Groups API (`/api/groupsApi.ts`)

#### Methods

##### `getAll(filters?)`
Fetches all groups with optional filtering.

```typescript
const groups = await groupsApi.getAll({
  search: 'tech',
  visibility: 'open'
});
```

**Returns:** `Promise<Group[]>`

##### `getById(id)`
Fetches a single group with members and activities.

```typescript
const group = await groupsApi.getById('group-uuid');
```

**Returns:** `Promise<Group | null>`

##### `create(groupData)`
Creates a new group.

```typescript
const newGroup = await groupsApi.create({
  name: 'React Developers',
  description: 'Local React developers meetup',
  visibility: 'open'
});
```

**Returns:** `Promise<Group | null>`

### News API (`/api/newsApi.ts`)

#### Methods

##### `getAll(filters?)`
Fetches news articles with optional filtering.

```typescript
const articles = await newsApi.getAll({
  search: 'community',
  tags: ['announcement'],
  featured: true
});
```

**Returns:** `Promise<NewsArticle[]>`

##### `getBySlug(slug)`
Fetches a single article by URL slug.

```typescript
const article = await newsApi.getBySlug('community-update-2024');
```

**Returns:** `Promise<NewsArticle | null>`

### Resources API (`/api/resourcesApi.ts`)

#### Methods

##### `getAll(filters?)`
Fetches resources with optional filtering.

```typescript
const resources = await resourcesApi.getAll({
  search: 'tutorial',
  types: ['guide', 'video'],
  tags: ['react']
});
```

**Returns:** `Promise<Resource[]>`

## Data Adapters

All API modules use adapter functions to transform data between Supabase format and application format:

```typescript
// Example adapter pattern
export function adaptEventFromDatabase(dbEvent: SupabaseEvent): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    date: dbEvent.date,
    // ... other transformations
  };
}

export function adaptEventToDatabase(event: EventInput): SupabaseEventInsert {
  return {
    title: event.title,
    date: event.date,
    organizer_id: event.organizerId,
    // ... other transformations
  };
}
```

## React Query Hooks

The API is integrated with React Query for efficient data fetching:

```typescript
// Example usage
import { useEvents, useRegisterForEvent } from '@/hooks/useEventQueries';

function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const registerMutation = useRegisterForEvent();
  
  const handleRegister = async (eventId: string) => {
    await registerMutation.mutateAsync({
      eventId,
      memberId: currentUser.memberId
    });
  };
}
```

## Error Handling

All API methods follow consistent error handling patterns:

1. **Try-catch blocks** wrap all async operations
2. **Supabase errors** are logged with context
3. **Null/empty returns** on error for safe handling
4. **TypeScript strict null checks** ensure type safety

Example:
```typescript
async getById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      handleSupabaseError(error, 'fetching event by id');
      return null;
    }
    
    return data ? adaptEventFromDatabase(data) : null;
  } catch (error) {
    handleSupabaseError(error, 'fetching event by id');
    return null;
  }
}
```

## Authentication

API calls requiring authentication automatically include the user's JWT token:

```typescript
// Supabase client handles auth headers automatically
const { data, error } = await supabase
  .from('events')
  .insert({ ...eventData })
  .select();
```

## Rate Limiting

Supabase enforces rate limits:
- **Anonymous requests**: 100/minute
- **Authenticated requests**: 1000/minute

React Query helps manage this with:
- `staleTime`: 5 minutes for most queries
- `cacheTime`: 10 minutes
- Automatic retry with exponential backoff

## Testing

API modules can be tested with mock implementations:

```typescript
// Set environment variable
VITE_USE_SUPABASE=false

// Mock data is returned from hooks
const { data: events } = useEvents(); // Returns mock events
```

## Best Practices

1. **Always use TypeScript types** for API inputs/outputs
2. **Handle null cases** gracefully
3. **Use adapters** for data transformation
4. **Log errors with context** for debugging
5. **Validate inputs** before API calls
6. **Use React Query** for caching and synchronization
7. **Keep API modules focused** on single resources