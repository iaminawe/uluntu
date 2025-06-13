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
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite (100% passing)
npm run lint         # Run linter and format checks
npm run typecheck    # Run TypeScript type checking
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

## Code Style Guidelines

### Feature Development
1. **Keep features self-contained** - All code for a feature stays within its directory
2. **Use barrel exports** - Each feature has an index.ts exporting its public API
3. **Co-locate tests** - Tests live next to the code they test
4. **Minimize cross-feature dependencies** - Features should be as independent as possible

### Best Practices
- **TypeScript Required** - All new code must be TypeScript
- **Test Coverage** - Maintain 100% test coverage (currently 461/461 tests passing)
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
- Session management

### 🏢 Companies (`/features/companies`)
- Company profiles and listings
- Employee management
- Company search and filtering

### 👥 Directory (`/features/directory`)
- Member profiles and search
- Professional networking
- Contact management

### 📅 Events (`/features/events`)
- Event creation and management
- Calendar integration
- RSVP functionality

### 👫 Groups (`/features/groups`)
- Community groups
- Membership management
- Group discussions

### 🛍️ Marketplace (`/features/marketplace`)
- Buy/sell listings
- Product/service categories
- Contact sellers

### 📰 News (`/features/news`)
- News articles and updates
- Categories and tags
- Newsletter subscriptions

### 🎯 Onboarding (`/features/onboarding`)
- 5-step wizard
- Profile completion
- Privacy settings
- Company association

### 💼 Opportunities (`/features/opportunities`)
- Job postings
- Volunteer opportunities
- Application tracking

### 📚 Resources (`/features/resources`)
- Educational content
- Resource categories
- Bookmarking

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
  content: ContentState
}
```

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

## Important Notes

- Always maintain 100% test coverage
- Document architectural decisions
- Keep features independent and self-contained
- Use TypeScript for all new code
- Follow the established patterns and conventions

---

For questions or issues, please refer to the project documentation or create an issue in the repository.