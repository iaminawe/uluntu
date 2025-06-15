# Claude Code Configuration - Nelson Tech Community Platform

## Project Overview
The Nelson Tech Community Platform is built using a **feature-based architecture** with the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic Test-Driven Development.

## Project Structure

```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication & authorization
│   ├── companies/     # Company profiles & management
│   ├── directory/     # Member directory & profiles
│   ├── events/        # Events & calendar
│   ├── groups/        # Groups & communities
│   ├── marketplace/   # Buy/sell marketplace
│   ├── news/          # News & articles
│   ├── onboarding/    # User onboarding flow
│   ├── opportunities/ # Job & volunteer opportunities
│   └── resources/     # Educational resources
├── shared/            # Shared code
│   ├── components/    # Reusable UI components
│   ├── contexts/      # Global React contexts
│   ├── hooks/         # Shared custom hooks
│   ├── lib/           # External library configs
│   ├── types/         # Shared TypeScript types
│   └── utils/         # Shared utilities
├── pages/             # Route pages (thin layers)
├── store/             # Redux store configuration
└── tests/             # Integration & E2E tests
```

### Feature Module Structure
Each feature contains:
- `components/` - Feature-specific React components
- `hooks/` - Custom React hooks
- `api/` - API calls and data fetching
- `store/` - Redux slices and state management
- `types/` - TypeScript type definitions
- `utils/` - Helper functions and utilities
- `__tests__/` - Feature tests

## Development Commands

### Standard Commands
```bash
npm run dev          # Start development server (port 5555)
npm run build        # Build for production
npm run test         # Run test suite (100% passing)
npm run lint         # Run linter and format checks
npm run typecheck    # Run TypeScript type checking
```

### Database Commands
```bash
supabase start       # Start local Supabase stack
supabase db reset    # Reset database with migrations and seed data
supabase migration new <name>  # Create new migration
supabase db push     # Apply migrations to remote database
```

### Database Setup & Seeding
```bash
# 1. Add missing columns to existing tables
psql -f add_tags_to_resources.sql

# 2. Seed resources and marketplace with sample data
psql -f seed_resources_marketplace_fixed.sql

# 3. Create the new tagging system infrastructure
psql -f create_minimal_tags_system.sql

# 4. Populate tags and create relationships
psql -f seed_tags_system.sql
```

### SPARC Development Commands
```bash
# List available SPARC modes
npx claude-flow sparc modes

# Run specific SPARC mode
npx claude-flow sparc run <mode> "<task>"

# Execute TDD workflow
npx claude-flow sparc tdd "<feature>"

# Get mode information
npx claude-flow sparc info <mode>
```

## SPARC Methodology Workflow

### 1. Specification Phase
```bash
npx claude-flow sparc run spec-pseudocode "Define feature requirements"
```

### 2. Architecture Phase
```bash
npx claude-flow sparc run architect "Design feature architecture"
```

### 3. TDD Implementation Phase
```bash
npx claude-flow sparc tdd "implement feature with tests"
```

### 4. Integration Phase
```bash
npx claude-flow sparc run integration "integrate feature components"
```

### 5. Documentation Phase
```bash
npx claude-flow sparc run docs-writer "create feature documentation"
```

## Import Conventions

Use absolute imports with the @ alias:
```typescript
// Feature imports
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CompaniesList } from '@/features/companies/components/CompaniesList';

// Shared imports
import { Button } from '@/shared/components/ui/Button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatDate } from '@/shared/utils/dateUtils';

// Store imports
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
```

## Supabase Client Usage

**IMPORTANT:** Always use the Supabase client from `@/lib/supabase`:

```typescript
import { supabase, sessionCache } from '@/lib/supabase';
```

**DO NOT** create new Supabase client instances or use the deprecated `@/lib/supabaseClient` file (which has been removed).

The main Supabase file (`/src/lib/supabase.ts`) provides:
- `supabase` - The single Supabase client instance
- `sessionCache` - WeakMap for session conversions
- Authentication helper functions (`signIn`, `signUp`, `signOut`, etc.)
- Connection checking utilities

## Environment Variable Usage

**IMPORTANT:** Use the correct method for accessing environment variables:

### In Client-Side Code (Browser)
```typescript
// Use import.meta.env for Vite environment variables
const apiKey = import.meta.env.VITE_RESEND_API_KEY;
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
const mode = import.meta.env.MODE; // 'development' | 'production' | 'test'
```

### In Shared Code (Browser & Tests)
```typescript
// Use the centralized config helper to avoid test issues
import { IS_SUPABASE_ENABLED } from '@/config/env';

if (IS_SUPABASE_ENABLED) {
  // Use Supabase
} else {
  // Use mock data
}
```

**DO NOT** use `process.env` in client-side code as it will cause runtime errors.

### Test Environment
- Tests use `.env.test` with `VITE_USE_SUPABASE=false` to ensure consistent mock data usage
- Production uses `.env` with `VITE_USE_SUPABASE=true` for real database access

## Code Style Guidelines

### Feature Development
1. **Keep features self-contained** - All code for a feature stays within its directory
2. **Use barrel exports** - Each feature has an index.ts exporting its public API
3. **Co-locate tests** - Tests live next to the code they test
4. **Minimize cross-feature dependencies** - Features should be as independent as possible

### Best Practices
- **TypeScript Required** - All new code must be TypeScript
- **Test Coverage** - Maintain high test coverage (currently 397/428 tests passing - 92.5%)
- **Component Size** - Keep components under 200 lines
- **File Size** - Keep files under 500 lines
- **Function Size** - Keep functions under 50 lines

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with descriptive suffixes (e.g., `UserProfileProps`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## Current Features

### 🔐 Auth (`/features/auth`)
- User authentication (sign in/up/out)
- Password reset functionality
- Protected routes and role-based access
- Session management with Supabase
- Role-based permissions (authenticated, group_member, admin, superadmin)

### 🏢 Companies (`/features/companies`)
- Company profiles and listings
- Industry categorization (array-based)
- Company size and location tracking
- Employee management via company_members table
- Tag-based organization and filtering

### 👥 Directory (`/features/directory`)
- Member profiles and search
- Professional networking
- Contact management
- Skill tracking with member_tags (with experience levels)
- Employment status and location tracking

### 📅 Events (`/features/events`)
- Event creation and management
- Calendar integration with date/time support
- RSVP functionality via event_attendees
- Multi-session events with event_sessions
- Presenter management and resource linking
- Location and capacity management
- Tag-based categorization

### 👫 Groups (`/features/groups`)
- Community groups with visibility controls
- Membership management via group_members
- Group discussions and activities
- Member count tracking
- Tag-based organization

### 🛍️ Marketplace (`/features/marketplace`)
- Buy/sell listings with images array
- Product/service categories
- Contact sellers via JSON contact_info
- Condition tracking and pricing
- Location-based listings
- Tag-based filtering and search

### 📰 News (`/features/news`)
- News articles with rich content
- Hero images and excerpts
- Publication date management
- Author attribution
- Tag-based categorization
- News associations for related content

### 🎯 Onboarding (`/features/onboarding`)
- 5-step wizard
- Profile completion
- Privacy settings
- Company association

### 💼 Opportunities (`/features/opportunities`)
- Job postings with detailed information
- Volunteer opportunities
- Application tracking and deadlines
- Remote work options
- Salary range and benefits
- Tag-based categorization

### 📚 Resources (`/features/resources`)
- Educational content with multiple types
- Resource categories and descriptions
- Contributor attribution
- Group association
- Array-based and relational tagging
- Status management (published/draft)

### 🏷️ Tagging System
- **Reusable Tags**: Central tags table with 85+ predefined tags
- **Categories**: Technology, Industry, Location, Skills, Products, Brands, Features
- **Relational Tagging**: Junction tables for all content types
- **Array-based Tags**: Legacy support for existing implementations
- **Usage Tracking**: Automatic tag usage counts via triggers
- **Color-coded**: Visual organization with hex color codes
- **Slug Generation**: URL-friendly tag identifiers

### 📧 Newsletter System
- **Campaign Management**: Create and manage email campaigns
- **Subscriber Management**: Track subscriptions and preferences
- **Analytics Dashboard**: Campaign performance metrics
- **Template System**: Reusable email templates
- **Automated Campaigns**: Scheduled and triggered emails

### 🔧 Admin Dashboard (`/pages/admin/`)
- **Entity Management**: Admin pages for all content types
- **Sample Content**: Import/remove sample data functionality
- **User Management**: Role assignment and user oversight
- **Content Moderation**: Review and approve user submissions
- **Analytics**: Platform usage and performance metrics
- **Audit Logging**: Track all administrative actions
- **Feature Flags**: Toggle platform features
- **Newsletter Dashboard**: Email campaign management

## Redux Store Structure

```typescript
{
  auth: AuthState,
  companies: CompaniesState,
  members: MembersState,
  events: EventsState,
  groups: GroupsState,
  marketplace: MarketplaceState,
  news: NewsState,
  opportunities: OpportunitiesState,
  resources: ResourcesState,
  content: ContentState,
  tags: TagsState,
  newsletter: NewsletterState,
  admin: AdminState
}
```

### State Management Features
- **Centralized Auth**: User sessions, roles, and permissions
- **Content Management**: CRUD operations for all entity types
- **Tag Management**: Reusable tags with usage tracking
- **Admin Operations**: Moderation, user management, analytics
- **Newsletter Management**: Campaign creation and subscriber tracking
- **Real-time Updates**: Optimistic updates with error handling

## Testing Strategy

### Test Organization
- **Unit Tests**: Co-located with components in `__tests__` folders
- **Integration Tests**: In `/src/tests/integration/`
- **E2E Tests**: In `/src/tests/e2e/`

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific feature tests
npm test features/auth
```

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Feature Flags
VITE_USE_SUPABASE=true
VITE_USE_MOCK_DATA=false
```

## Git Workflow

### Branch Naming
- `feature/<feature-name>` - New features
- `fix/<issue-description>` - Bug fixes
- `refactor/<component-name>` - Code refactoring
- `docs/<doc-name>` - Documentation updates

### Commit Messages
Follow conventional commits:
- `feat: Add user profile editing`
- `fix: Resolve authentication token refresh`
- `refactor: Simplify marketplace filtering logic`
- `docs: Update API documentation`
- `test: Add company profile tests`

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure you're using @ alias imports
   - Check that the file exists in the new location
   - Run `npx tsc --noEmit` to check for type errors

2. **Test Failures**
   - Clear test cache: `npm test -- --clearCache`
   - Check for mock updates needed
   - Ensure test imports are updated

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check for circular dependencies
   - Verify environment variables are set

## Project Maintenance

### Regular Tasks
1. **Weekly**: Run full test suite
2. **Before PR**: Run lint, typecheck, and tests
3. **Monthly**: Check for dependency updates
4. **Quarterly**: Review and update documentation

### Code Quality Checks
```bash
# Run all checks
npm run lint && npm run typecheck && npm test

# Check for circular dependencies
npx madge --circular src/

# Check bundle size
npm run build && npm run analyze
```

## Resources

- **Project Documentation**: `/docs/README.md`
- **API Documentation**: `/docs/api/`
- **Component Storybook**: Run `npm run storybook`
- **SPARC Methodology**: [Claude-Flow Docs](https://github.com/ruvnet/claude-code-flow/docs/sparc.md)

## Database Schema

### Core Tables

#### Authentication & Users
- `members` - User profiles with bio, skills, employment status
- `user_roles` - Role assignments (authenticated, group_member, admin, superadmin)
- `member_skills` - Legacy simple skill tracking
- `member_tags` - Enhanced skill tracking with levels and experience

#### Content Tables
- `companies` - Company profiles with industry arrays and verification status
- `company_members` - Company-member relationships
- `events` - Events with sessions, presenters, and attendees
- `event_sessions` - Multi-session event support
- `event_attendees` - RSVP tracking
- `event_presenters` - Speaker management
- `groups` - Community groups with visibility controls
- `group_members` - Group membership tracking
- `news` - Articles with hero images and excerpts
- `news_associations` - Related content linking
- `resources` - Educational content with contributor attribution
- `opportunities` - Job/volunteer postings with detailed metadata
- `marketplace_listings` - Buy/sell listings with contact info

#### Tagging System
- `tags` - Central reusable tags with colors and categories
- `event_tags`, `news_tags`, `group_tags`, `company_tags` - Junction tables
- `member_tags`, `opportunity_tags`, `marketplace_tags` - Enhanced tagging
- `resource_tags` - Legacy string-based tags (to be migrated)

#### Admin & Management
- `admin_features` - Feature flags and configuration
- `admin_feature_translations` - Multi-language support
- `custom_roles` - Custom role definitions
- `moderation_queue` - Content moderation workflow
- `admin_audit_log` - Administrative action tracking

#### Newsletter System
- `newsletter_campaigns` - Email campaign management
- `newsletter_subscribers` - Subscription tracking
- `newsletter_templates` - Reusable email templates
- `newsletter_analytics` - Campaign performance metrics

### Key Schema Features
- **UUID Primary Keys** - All tables use UUID for better scalability
- **Row Level Security (RLS)** - Comprehensive security policies
- **JSONB Support** - Contact info, permissions, and configuration data
- **Array Support** - Tags, images, and multi-value fields
- **Timestamp Tracking** - Created/updated timestamps with triggers
- **Referential Integrity** - Foreign keys with cascade deletes

## Sample Content Management

The platform includes a comprehensive sample content system for development and testing:

### Migration: `20250614000000_create_sample_content_management.sql`
- Creates sample content tables and management functions
- Includes 15 sample members with varied profiles
- 13 entities each for companies, groups, events, news articles, and resources
- Rich relationships between all entities

### Admin Dashboard Access
- Navigate to `/admin` (requires admin/superadmin role)
- Use "Sample Content" tab to import/remove sample data
- Real-time status display and error handling
- One-click import/remove functionality

### Database Functions
- `import_sample_content()` - Safely imports all sample data
- `remove_sample_content()` - Removes sample data by UUID patterns
- `get_sample_content_status()` - Returns current import status

## Important Notes

- Always maintain 100% test coverage
- Document architectural decisions
- Keep features independent and self-contained
- Use TypeScript for all new code
- Follow the established patterns and conventions

---

For questions or issues, please refer to the project documentation or create an issue in the repository.