# Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Administrative System](#administrative-system)
7. [State Management](#state-management)
8. [Authentication & Authorization](#authentication--authorization)
9. [Feature Implementation Details](#feature-implementation-details)
10. [Testing](#testing)
11. [Deployment](#deployment)

## Architecture Overview

The Kootenay Tech Community platform is built with a modern, scalable architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│  Redux + RTK    │────▶│   Supabase      │
│   (Frontend)    │     │  (State Mgmt)   │     │   (Backend)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TypeScript    │     │  React Query    │     │   PostgreSQL    │
│   Tailwind CSS  │     │  (Data Fetching)│     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Technology Stack

### Frontend
- **React 18.3** - UI library
- **Vite 6.0** - Build tool and dev server
- **TypeScript 5.7** - Type safety
- **Tailwind CSS 3.4** - Styling
- **React Router 7.0** - Navigation
- **React Query (TanStack Query)** - Server state management
- **Redux Toolkit 2.5** - Client state management

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for file uploads

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **MSW** - API mocking

## Project Structure

```
src/
├── api/                 # API client modules
│   ├── admin/          # Administrative API layer
│   │   ├── features.ts
│   │   ├── roles.ts
│   │   ├── moderation.ts
│   │   ├── stats.ts
│   │   └── audit.ts
│   ├── eventsApi.ts
│   ├── marketplaceApi.ts
│   ├── membersApi.ts
│   └── supabaseUtils.ts
├── adapters/           # Data transformation layers
│   ├── eventAdapter.ts
│   ├── marketplaceAdapters.ts
│   └── memberAdapter.ts
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   ├── admin/         # Administrative components
│   │   └── EntityTable.tsx
│   ├── EventsList/
│   ├── MarketplaceList/
│   └── MembersList/
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useEventQueries.ts
│   └── useCurrentMember.ts
├── pages/             # Page components
│   ├── admin/         # Administrative pages
│   │   ├── AdminLayout.tsx
│   │   ├── Dashboard.tsx
│   │   ├── UsersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ModerationPage.tsx
│   │   ├── RolesPage.tsx
│   │   ├── AuditPage.tsx
│   │   └── entities/
│   ├── EventDetailPage/
│   ├── MarketplaceEditPage/
│   └── HomePage/
├── redux/             # Redux store and slices
│   ├── store.ts
│   └── slices/
├── router/            # Routing configuration
├── types/             # TypeScript type definitions
│   ├── admin.ts       # Administrative type definitions
│   ├── common.ts
│   ├── marketplace.ts
│   └── supabase.ts
└── tests/             # Test files
```

## Database Schema

### Core Tables

#### `members`
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `name` (TEXT)
- `email` (TEXT)
- `title` (TEXT)
- `bio` (TEXT)
- `image` (TEXT)
- `location` (TEXT)
- `status` (TEXT)
- `created_at` (TIMESTAMPTZ)

#### `events`
- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `date` (TIMESTAMPTZ)
- `end_date` (TIMESTAMPTZ)
- `location` (TEXT)
- `type` (TEXT: 'in-person' | 'online' | 'hybrid')
- `organizer_id` (UUID, FK to members)
- `max_attendees` (INTEGER)
- `current_attendees` (INTEGER)
- `status` (TEXT)

#### `event_attendees`
- `event_id` (UUID, FK to events)
- `member_id` (UUID, FK to members)
- `registered_at` (TIMESTAMPTZ)
- `status` (TEXT)
- Primary Key: (event_id, member_id)

#### `marketplace_listings`
- `id` (UUID, PK)
- `title` (TEXT)
- `description` (TEXT)
- `type` (TEXT)
- `price` (NUMERIC)
- `condition` (TEXT)
- `images` (TEXT[])
- `location` (TEXT)
- `seller_id` (UUID, FK to members)
- `contact_email` (TEXT)
- `contact_phone` (TEXT)
- `contact_method` (TEXT)
- `show_contact_info` (BOOLEAN)
- `status` (TEXT)

### Administrative Tables

#### `admin_features`
- `id` (UUID, PK)
- `feature_key` (TEXT, UNIQUE)
- `enabled` (BOOLEAN)
- `config` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `admin_feature_translations`
- `id` (UUID, PK)
- `feature_id` (UUID, FK to admin_features)
- `language_code` (TEXT)
- `translations` (JSONB)
- `created_at` (TIMESTAMPTZ)

#### `roles`
- `id` (UUID, PK)
- `name` (TEXT, UNIQUE)
- `description` (TEXT)
- `permissions` (JSONB)
- `is_system` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

#### `user_roles`
- `user_id` (UUID, FK to auth.users)
- `role_id` (UUID, FK to roles)
- `assigned_at` (TIMESTAMPTZ)
- `assigned_by` (UUID, FK to auth.users)
- Primary Key: (user_id, role_id)

#### `moderation_queue`
- `id` (UUID, PK)
- `entity_type` (TEXT)
- `entity_id` (UUID)
- `status` (TEXT)
- `submitted_by` (UUID, FK to auth.users)
- `reviewed_by` (UUID, FK to auth.users)
- `submitted_at` (TIMESTAMPTZ)
- `reviewed_at` (TIMESTAMPTZ)
- `review_notes` (TEXT)

#### `admin_audit_log`
- `id` (UUID, PK)
- `admin_id` (UUID, FK to auth.users)
- `action` (TEXT)
- `entity_type` (TEXT)
- `entity_id` (UUID)
- `changes` (JSONB)
- `created_at` (TIMESTAMPTZ)

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Public read access for published content
- Authenticated users can create content
- Users can only update/delete their own content
- Admins have full access

## API Documentation

### Events API

```typescript
// Get all events with filters
eventsApi.getAll(filters?: {
  search?: string;
  types?: string[];
  dateRange?: string;
})

// Register for an event
eventsApi.registerForEvent(eventId: string, memberId: string)

// Get event attendees
eventsApi.getEventAttendees(eventId: string)
```

### Marketplace API

```typescript
// Create a listing
marketplaceApi.create({
  title: string;
  description: string;
  price: number;
  contactEmail?: string;
  contactPhone?: string;
  contactMethod?: 'email' | 'phone' | 'both';
})

// Update listing
marketplaceApi.update(id: string, data: Partial<MarketplaceItem>)
```

### Members API

```typescript
// Get member by user ID
membersApi.getByUserId(userId: string)

// Get members by company
membersApi.getByCompany(companyId: string)
```

## Administrative System

### Admin API Layer

The administrative system provides a comprehensive API layer for platform management:

#### Features API (`src/api/admin/features.ts`)
```typescript
// Feature flag management
adminFeaturesApi.getFeatures()
adminFeaturesApi.toggleFeature(featureKey: string, enabled: boolean)
adminFeaturesApi.updateFeatureConfig(featureKey: string, config: object)
adminFeaturesApi.isFeatureEnabled(featureKey: string)

// Translation management
adminFeaturesApi.getFeatureTranslations(featureId: string)
adminFeaturesApi.upsertFeatureTranslation(featureId: string, languageCode: string, translations: object)
```

#### Roles API (`src/api/admin/roles.ts`)
```typescript
// Role management
adminRolesApi.getRoles()
adminRolesApi.createRole(role: RoleData)
adminRolesApi.updateRole(id: string, updates: Partial<Role>)
adminRolesApi.deleteRole(id: string)

// User role assignment
adminRolesApi.assignRole(userId: string, roleId: string)
adminRolesApi.removeRole(userId: string, roleId: string)
adminRolesApi.getUserRoles(userId: string)
adminRolesApi.checkPermission(userId: string, resource: string, action: string)
```

#### Moderation API (`src/api/admin/moderation.ts`)
```typescript
// Content moderation
adminModerationApi.getModerationQueue(filters?: ModerationFilters)
adminModerationApi.approveContent(itemId: string, notes?: string)
adminModerationApi.rejectContent(itemId: string, notes: string)
adminModerationApi.getContentDetails(entityType: string, entityId: string)
```

#### Stats API (`src/api/admin/stats.ts`)
```typescript
// Platform statistics
adminStatsApi.getOverviewStats()
adminStatsApi.getActivityStats(dateRange?: DateRange)
```

#### Audit API (`src/api/admin/audit.ts`)
```typescript
// Audit logging
adminAuditApi.getAuditLogs(filters?: AuditFilters)
adminAuditApi.exportAuditLogs(filters?: AuditFilters)
```

### Admin Pages Architecture

#### AdminLayout (`src/pages/admin/AdminLayout.tsx`)
- Sidebar navigation with role verification
- Responsive design with mobile menu
- Superadmin access control

#### Dashboard (`src/pages/admin/Dashboard.tsx`)
- Platform overview statistics
- Recent activity feed
- Pending moderation alerts
- Quick action cards

#### Entity Management
- Generic EntityTable component for all entities
- Reusable table with search, sort, pagination
- Bulk operations (delete, export)
- Custom actions per entity type

#### Settings Management
- Feature flag toggles with configuration
- Multi-language translation editor
- Real-time feature updates

### Security Architecture

#### Access Control
- **Superadmin Role**: Ultimate platform access
- **RLS Policies**: Database-level security
- **Permission System**: Granular action control
- **Audit Trail**: Complete action logging

#### Permission Matrix
```typescript
{
  "resources": ["members", "events", "groups", "marketplace", "news", "resources", "opportunities"],
  "actions": ["create", "read", "update", "delete", "moderate"],
  "roles": {
    "superadmin": { "*": ["*"] },
    "admin": { "content": ["create", "read", "update", "delete"] },
    "moderator": { "content": ["read", "moderate"] }
  }
}
```

### Internationalization (i18n)

#### Language Support
- 6 languages: English, Spanish, French, German, Chinese, Japanese
- Feature-specific translations
- Admin translation management interface

#### Translation Structure
```typescript
{
  "title": "Feature Title",
  "description": "Feature Description", 
  "createButton": "Create New",
  "editButton": "Edit",
  "deleteButton": "Delete",
  "searchPlaceholder": "Search...",
  "emptyState": "No items found",
  "loadingState": "Loading...",
  "errorState": "Error occurred"
}
```

## State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null;
    session: Session | null;
    status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  },
  events: {
    items: Event[];
    filteredItems: Event[];
    currentItem: Event | null;
    filters: EventFilters;
  },
  marketplace: {
    listings: MarketplaceItem[];
    currentListing: MarketplaceItem | null;
  },
  members: {
    items: Member[];
    currentMember: Member | null;
  }
}
```

### React Query Integration

React Query handles server state with Redux managing UI state:

```typescript
// Event queries
useEvents() // Get all events
useEvent(id) // Get single event
useRegisterForEvent() // Register mutation
useEventAttendees(eventId) // Get attendees

// Marketplace queries
useMarketplaceItems() // Get all listings
useCreateListing() // Create mutation
```

## Authentication & Authorization

### Authentication Flow

1. User signs up/signs in via Supabase Auth
2. Supabase returns JWT and user session
3. JWT stored in Redux and used for API calls
4. Member profile created/fetched on auth

### Authorization Levels

- **Guest**: Can view public content
- **Authenticated User**: Can create content, register for events  
- **Content Owner**: Can edit/delete own content
- **Moderator**: Can moderate content and manage users
- **Admin**: Full access to content management features
- **Superadmin**: Ultimate platform access including administrative dashboard

### Protected Routes

```typescript
<ProtectedRoute requireAuth>
  <MarketplaceEditPage />
</ProtectedRoute>
```

## Feature Implementation Details

### Event Management System

**Features Implemented:**
- Event creation with sessions, presenters, resources
- Registration/unregistration flow
- Attendee management for organizers
- Event discovery with search and filters
- Calendar view integration

**Key Components:**
- `EventDetailPage` - Full event view with registration
- `RegisterSidebar` - Smart registration UI
- `AttendeesList` - Attendee management
- `EventSessions` - Session details with video embedding

### Marketplace System

**Features Implemented:**
- Listing creation/editing with validation
- Contact information management
- Seller profiles from member data
- Search and filtering
- Contact modal with direct contact info

**Key Components:**
- `MarketplaceEditPage` - Create/edit listings
- `ContactInfoSection` - Contact preferences
- `ContactModal` - Buyer-seller communication
- `useCurrentMember` - Auto-populate seller info

### Groups Management

**Features Implemented:**
- Group creation and management
- Member roles (admin/member)
- Group visibility settings
- Group events and resources

### Real-time Features

Using Supabase subscriptions:
```typescript
supabase
  .from('events')
  .on('INSERT', payload => {
    // Handle new event
  })
  .subscribe()
```

## Testing

### Unit Tests
```bash
npm test
```

### Test Coverage

#### Admin API Tests (✅ All Passing)
- **Features API**: 9 tests covering feature flag management
- **Roles API**: 12 tests covering role and permission management
- **Total**: 21/21 admin API tests passing

#### Component Tests
- **Admin Pages**: Integration tests for all admin pages
- **EntityTable**: Component tests for generic table functionality
- **UI Components**: Unit tests for reusable components

### Test Structure
```typescript
describe('Event Registration', () => {
  it('should register user for event', async () => {
    // Test implementation
  });
});

describe('Admin Features API', () => {
  it('should toggle feature enabled status', async () => {
    // Admin-specific test implementation
  });
});
```

### Mock Data
- Mock data in `src/data/mock/`
- Admin API mocking for integration tests
- API mocking with MSW for integration tests

## Deployment

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_USE_SUPABASE=true
```

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Database Migrations

Migrations in `supabase/migrations/`:
- Run with `supabase db push`
- Version controlled with timestamps
- **Required**: `20250113_admin_features.sql` for admin functionality

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied (including admin features)
- [ ] RLS policies verified (including admin tables)
- [ ] Build optimizations enabled
- [ ] Error tracking configured
- [ ] Performance monitoring set up
- [ ] Superadmin role assigned to initial admin user
- [ ] Admin dashboard accessibility verified (/admin route)
- [ ] Feature flags configured for production environment

## Performance Optimizations

- **Code Splitting**: Dynamic imports for routes
- **React Query Caching**: 5-minute stale time
- **Image Optimization**: Lazy loading, WebP format
- **Bundle Size**: Tree shaking, minification
- **Database Indexes**: On foreign keys and search fields

## Security Considerations

- **RLS Policies**: Enforce data access at database level
- **Input Validation**: Client and server-side validation
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Supabase handles automatically
- **Secure Headers**: Set via hosting provider

## Future Enhancements

### Platform Features
- **Image Upload**: Direct file upload to Supabase Storage
- **In-app Messaging**: Real-time chat between users
- **Payment Processing**: Stripe integration for marketplace
- **Email Notifications**: Event reminders, new messages
- **Mobile App**: React Native implementation

### Administrative Enhancements  
- **Advanced Analytics**: Detailed user behavior tracking
- **Content Scheduling**: Schedule publication of news and events
- **Bulk Import/Export**: CSV import for bulk data operations
- **Custom Reports**: Configurable reporting dashboard
- **API Rate Limiting**: Prevent abuse with configurable limits
- **Advanced Moderation**: AI-powered content filtering
- **Multi-tenant Support**: Support for multiple communities