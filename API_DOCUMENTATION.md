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