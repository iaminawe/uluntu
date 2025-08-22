# Dashboard Component Specifications

## Component Architecture Overview

The dashboard system follows a hierarchical component structure with clear separation of concerns and reusable UI patterns.

```
DashboardLayout
├── DashboardHeader
│   ├── NotificationDropdown
│   └── QuickSearchDropdown
├── DashboardSidebar
└── Page Components
    ├── DashboardOverview
    ├── MyContentPage
    │   ├── ContentTabs
    │   ├── QuickActions
    │   ├── ContentFilters
    │   ├── ContentGrid
    │   └── ContentList
    ├── DashboardAnalytics
    ├── ActivityPage
    └── DashboardSettings
```

## Core Components

### DashboardLayout

**Purpose**: Main layout wrapper providing consistent structure
**Location**: `src/features/dashboard/components/DashboardLayout/index.tsx`

```typescript
interface DashboardLayoutProps {
  // No props - uses Outlet for nested routing
}
```

**Features**:
- Responsive layout with collapsible sidebar
- Authentication guard
- Loading states
- Error boundaries

**States**:
- Loading: Shows spinner while fetching user data
- Error: Shows error message with retry option
- Loaded: Shows dashboard content

---

### DashboardHeader

**Purpose**: Top navigation with search and notifications
**Location**: `src/features/dashboard/components/DashboardHeader/index.tsx`

```typescript
interface DashboardHeaderProps {
  user?: DashboardUser;
  onMobileMenuToggle?: () => void;
}
```

**Features**:
- Global search with live suggestions
- Notification dropdown with unread counts
- User avatar and quick settings access
- Mobile-responsive with hamburger menu

**Interactions**:
- Search triggers live results dropdown
- Notifications show activity feed
- Settings link navigates to preferences

---

### DashboardSidebar

**Purpose**: Left navigation with content type organization
**Location**: `src/features/dashboard/components/DashboardSidebar/index.tsx`

```typescript
interface DashboardSidebarProps {
  stats?: DashboardStats;
  className?: string;
}
```

**Features**:
- Hierarchical navigation structure
- Content type counts in badges
- Active state highlighting
- Collapsible on mobile

**Navigation Structure**:
```
Dashboard
├── Overview
├── My Content
├── Analytics
└── Activity

Content Types
├── Events (count)
├── News (count)
├── Resources (count)
├── Groups (count)
├── Marketplace (count)
├── Opportunities (count)
├── Galleries (count)
└── Messages (count)

Settings
```

---

### MyContentPage

**Purpose**: Main content management interface
**Location**: `src/features/dashboard/components/MyContentPage/index.tsx`

```typescript
interface MyContentPageProps {
  // No props - manages internal state
}
```

**Features**:
- Tabbed interface for content types
- Search and filtering
- Grid/List view toggle
- Pagination with infinite scroll
- Bulk actions
- Quick content creation

**State Management**:
```typescript
const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [showFilters, setShowFilters] = useState(false);
const [search, setSearch] = useState('');
const [filters, setFilters] = useState<ContentFilter>({...});
```

---

### ContentTabs

**Purpose**: Content type navigation with counts
**Location**: `src/features/dashboard/components/ContentTabs/index.tsx`

```typescript
interface ContentTabsProps {
  activeTab: ContentType | 'all';
  onTabChange: (tab: ContentType | 'all') => void;
  stats?: {
    totalByType: Record<ContentType, number>;
    totalByStatus: Record<string, number>;
  };
}
```

**Features**:
- Icon-based tabs with labels
- Count badges for each content type
- Responsive horizontal scrolling
- Active state styling

**Tab Configuration**:
```typescript
const tabConfigs: TabConfig[] = [
  { id: 'all', label: 'All Content', icon: Grid3X3, color: 'gray' },
  { id: 'event', label: 'Events', icon: Calendar, color: 'blue' },
  { id: 'news', label: 'News', icon: FileText, color: 'green' },
  // ... more tabs
];
```

---

### ContentGrid

**Purpose**: Card-based content display
**Location**: `src/features/dashboard/components/ContentGrid/index.tsx`

```typescript
interface ContentGridProps {
  content: UserContentSummary[];
  isLoading: boolean;
  error: Error | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onRefresh?: () => void;
}
```

**Features**:
- Responsive grid layout (1-3 columns)
- Cover image support
- Status and type badges
- Quick action buttons (edit, view, delete)
- Analytics preview (views, engagement)
- Featured content highlighting

**Card Layout**:
```
┌─────────────────────┐
│   Cover Image       │
├─────────────────────┤
│ [Type] [Status]  ⋯  │
│ Content Title       │
│ Description...      │
│ 👁 123  ❤ 45  2h ago │
│ [⭐ Featured]       │
└─────────────────────┘
```

---

### QuickActions

**Purpose**: Content creation shortcuts
**Location**: `src/features/dashboard/components/QuickActions/index.tsx`

```typescript
interface QuickActionsProps {
  // No props - uses static configuration
}
```

**Features**:
- Featured actions always visible
- Dropdown for additional actions
- Icon and color coding
- Permission-based visibility

**Action Types**:
- Create Event (blue)
- Write Article (green)
- Add Resource (yellow)
- Create Group (purple)
- List Item (orange)
- Post Opportunity (red)
- Create Gallery (pink)

---

### NotificationDropdown

**Purpose**: Activity notifications and alerts
**Location**: `src/features/dashboard/components/NotificationDropdown/index.tsx`

```typescript
interface NotificationDropdownProps {
  // No props - fetches data internally
}
```

**Features**:
- Unread count badge
- Notification type icons
- Mark as read functionality
- Direct links to content
- "Mark all read" option
- Real-time updates

**Notification Types**:
- Content published 📝
- Content featured ⭐
- New group member 👥
- Event created 📅
- Comment added 💬
- Content liked ❤️
- User mentioned 🏷️
- New follower 👤
- Collaboration invite 🤝
- System announcement 📢
- Topic trending 📈
- Milestone reached 🎉

## Data Flow

### Content Loading Flow

```
1. User navigates to dashboard
2. DashboardLayout loads user data
3. MyContentPage requests content with filters
4. ContentTabs shows counts by type
5. ContentGrid displays results
6. User interactions trigger re-fetches
```

### Search Flow

```
1. User types in search field
2. Debounced query triggers API call
3. QuickSearchDropdown shows suggestions
4. Selection updates main content view
5. URL updates with search params
```

### Notification Flow

```
1. Activity hook polls for updates
2. NotificationDropdown shows unread count
3. User clicks notification bell
4. Dropdown shows recent activity
5. Click notification navigates to content
6. Mark as read updates backend
```

## Responsive Design

### Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Layout Adaptations

**Mobile**:
- Sidebar hidden by default
- Hamburger menu in header
- Single column content grid
- Swipe navigation for tabs

**Tablet**:
- Collapsible sidebar
- Two column content grid
- Horizontal tab scrolling

**Desktop**:
- Fixed sidebar always visible
- Three column content grid
- All tabs visible

## Performance Optimizations

### Virtual Scrolling

For large content lists:
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedContentList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={120}
    itemData={items}
  >
    {ContentListItem}
  </List>
);
```

### Image Optimization

```typescript
const OptimizedImage = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    srcSet={`${src}?w=400 400w, ${src}?w=800 800w`}
    sizes="(max-width: 768px) 400px, 800px"
  />
);
```

### Memoization

```typescript
const ContentCard = React.memo(({ content }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.content.id === nextProps.content.id &&
         prevProps.content.updated_at === nextProps.content.updated_at;
});
```

## Accessibility

### Keyboard Navigation

- Tab order follows logical flow
- All interactive elements focusable
- Escape key closes dropdowns
- Arrow keys navigate tabs

### Screen Reader Support

```typescript
// ARIA labels and descriptions
<button
  aria-label={`${unreadCount} unread notifications`}
  aria-expanded={isOpen}
  aria-haspopup="true"
>
  <Bell />
</button>

// Semantic HTML
<nav aria-label="Content types">
  <ul role="tablist">
    <li role="tab" aria-selected={isActive}>
      {tabName}
    </li>
  </ul>
</nav>
```

### Color Contrast

All color combinations meet WCAG AA standards:
- Text on background: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Status indicators use multiple signals (color + icon)

## Testing Strategy

### Unit Tests

```typescript
describe('ContentGrid', () => {
  it('renders content cards correctly', () => {
    render(<ContentGrid content={mockContent} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('shows loading state', () => {
    render(<ContentGrid content={[]} isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('Dashboard Integration', () => {
  it('filters content by type', async () => {
    render(<MyContentPage />);
    
    fireEvent.click(screen.getByText('Events'));
    await waitFor(() => {
      expect(screen.getAllByText('event')).toHaveLength(2);
    });
  });
});
```

### E2E Tests

```typescript
test('complete content creation flow', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-event"]');
  await page.fill('[name="title"]', 'Test Event');
  await page.click('[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Deployment Considerations

### Bundle Optimization

```typescript
// Lazy load dashboard routes
const DashboardRoutes = lazy(() => import('@/features/dashboard/routes'));

// Code splitting by feature
const MyContentPage = lazy(() => 
  import('./components/MyContentPage').then(m => ({ default: m.MyContentPage }))
);
```

### Environment Configuration

```typescript
// Different API endpoints by environment
const API_CONFIG = {
  development: 'http://localhost:3000',
  staging: 'https://staging-api.example.com',
  production: 'https://api.example.com'
};
```

### Monitoring

```typescript
// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

This comprehensive specification provides the foundation for implementing a robust, scalable, and user-friendly dashboard system.