# Page Components

The Kootenay Tech Community application uses a set of consistent page-level components to provide a unified user experience across different sections of the app.

## PageHeader

`PageHeader` is used at the top of pages to provide a title, description, and optional actions.

### Usage

```tsx
import { PageHeader } from '../../components/ui/PageLayout';

function MyPage() {
  return (
    <PageHeader 
      title="Page Title" 
      description="Description of the page content"
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | The main heading for the page |
| `description` | string | undefined | Optional subtext explaining the page's purpose |
| `actions` | ReactNode | undefined | Optional buttons or links to place in the header |
| `breadcrumbs` | Array<{label: string, href: string}> | undefined | Optional breadcrumb navigation |
| `className` | string | '' | Additional CSS classes to apply |

### Examples

#### Basic Header

```tsx
<PageHeader 
  title="Tech Events" 
  description="Upcoming tech events in the Kootenay region"
/>
```

#### Header with Actions

```tsx
<PageHeader 
  title="Tech Events" 
  description="Upcoming tech events in the Kootenay region"
  actions={
    <button className="btn primary">Create Event</button>
  }
/>
```

#### Header with Breadcrumbs

```tsx
<PageHeader 
  title="Event Details" 
  breadcrumbs={[
    { label: 'Events', href: '/events' },
    { label: 'Tech Meetup', href: '/events/1' }
  ]}
/>
```

## ActionBar

`ActionBar` provides a consistent way to present filtering, search, and action controls for collections of items.

### Usage

```tsx
import { ActionBar } from '../../components/ui/PageLayout';

function MyListPage() {
  return (
    <ActionBar 
      searchPlaceholder="Search events..."
      onSearch={handleSearch}
      filters={/* filter components */}
      actions={/* action buttons */}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | string | 'Search...' | Placeholder text for the search input |
| `onSearch` | function | undefined | Callback function when search input changes |
| `filters` | ReactNode | undefined | Filter controls to display |
| `actions` | ReactNode | undefined | Action buttons to display |
| `className` | string | '' | Additional CSS classes to apply |

### Examples

#### Basic Search Bar

```tsx
<ActionBar 
  searchPlaceholder="Search companies..."
  onSearch={(term) => setSearchTerm(term)}
/>
```

#### With Filters and Actions

```tsx
<ActionBar 
  searchPlaceholder="Search events..."
  onSearch={handleSearch}
  filters={
    <select value={category} onChange={(e) => setCategory(e.target.value)}>
      <option value="">All Categories</option>
      <option value="workshop">Workshops</option>
      <option value="meetup">Meetups</option>
    </select>
  }
  actions={
    <button className="btn primary">Create Event</button>
  }
/>
```

## EmptyState

`EmptyState` provides a consistent way to display when no content is available, with optional actions.

### Usage

```tsx
import { EmptyState } from '../../components/ui/PageLayout';

function MyListPage() {
  const hasItems = items.length > 0;
  
  return (
    <>
      {!hasItems && (
        <EmptyState
          title="No items found"
          description="There are currently no items in this view."
          primaryAction={{
            text: "Create Item",
            onClick: handleCreateItem
          }}
        />
      )}
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Main heading text for the empty state |
| `description` | string | undefined | Optional description text |
| `icon` | ReactNode | undefined | Optional icon to display |
| `primaryAction` | { text: string, onClick: function } | undefined | Main call-to-action button |
| `primaryActionUrl` | string | undefined | URL for primary action if it's a link |
| `secondaryAction` | { text: string, onClick: function } | undefined | Optional secondary action |
| `secondaryActionUrl` | string | undefined | URL for secondary action if it's a link |
| `className` | string | '' | Additional CSS classes to apply |

### Examples

#### Basic Empty State

```tsx
<EmptyState
  title="No Events Found"
  description="There are no upcoming events scheduled at this time."
/>
```

#### With Primary Action

```tsx
<EmptyState
  title="No Resources Found"
  description="Be the first to share a valuable resource with the community!"
  primaryActionUrl="/resources/create"
  primaryAction={{
    text: "Add Resource",
    onClick: () => navigate('/resources/create')
  }}
/>
```

#### With Icon and Multiple Actions

```tsx
<EmptyState
  title="Your Cart is Empty"
  description="Add items to your cart to get started."
  icon={<ShoppingCart size={24} />}
  primaryAction={{
    text: "Browse Items",
    onClick: handleBrowse
  }}
  secondaryAction={{
    text: "View Saved Items",
    onClick: handleViewSaved
  }}
/>
```
