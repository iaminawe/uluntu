# Layout Components

Layout components provide the foundation for page structure in the Kootenay Tech Community application. They ensure consistent spacing, padding, and responsiveness across all pages.

## ContentContainer

`ContentContainer` is the primary layout component used to wrap page content. It provides consistent horizontal padding and maximum width constraints.

### Usage

```tsx
import { ContentContainer } from '../../components/ui/PageLayout';

function MyPage() {
  return (
    <ContentContainer>
      {/* Your page content goes here */}
    </ContentContainer>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Content to be rendered inside the container |
| `maxWidth` | 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '7xl' \| 'full' | '7xl' | Maximum width constraint for the container |
| `className` | string | '' | Additional CSS classes to apply |

### Examples

#### Default Container

```tsx
<ContentContainer>
  <h1>Page Title</h1>
  <p>Page content goes here.</p>
</ContentContainer>
```

#### Constrained Container

```tsx
<ContentContainer maxWidth="lg">
  <h1>Narrower Content</h1>
  <p>This content is constrained to a smaller maximum width.</p>
</ContentContainer>
```

## Card

The `Card` component provides a visually distinct container for related content with consistent styling and elevation.

### Usage

```tsx
import { Card } from '../../components/ui/Card';

function MyComponent() {
  return (
    <Card>
      {/* Card content goes here */}
    </Card>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Content to be rendered inside the card |
| `className` | string | '' | Additional CSS classes to apply |

### Examples

#### Basic Card

```tsx
<Card>
  <h2>Card Title</h2>
  <p>Card content goes here.</p>
</Card>
```

#### Card with Custom Styling

```tsx
<Card className="p-6 mb-4 overflow-hidden">
  <h2>Custom Card</h2>
  <p>This card has custom padding and margin.</p>
</Card>
```

## Common Layout Patterns

### Page with Header and Content

```tsx
<>
  <PageHeader title="Page Title" description="Page description" />
  
  <ContentContainer>
    <Card>
      <p>Main content goes here.</p>
    </Card>
  </ContentContainer>
</>
```

### Page with Multiple Cards

```tsx
<ContentContainer>
  <Card className="mb-6">
    <h2>Primary Content</h2>
    <p>This is the primary content section.</p>
  </Card>
  
  <Card>
    <h2>Secondary Content</h2>
    <p>This is the secondary content section.</p>
  </Card>
</ContentContainer>
```

### Two-Column Layout

```tsx
<ContentContainer>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">
      <Card>
        <h2>Main Content</h2>
        <p>This is the main content area.</p>
      </Card>
    </div>
    
    <div>
      <Card>
        <h2>Sidebar</h2>
        <p>This is the sidebar content.</p>
      </Card>
    </div>
  </div>
</ContentContainer>
```
