# Loading States

The Kootenay Tech Community application implements a consistent loading state pattern across different components to provide a better user experience during data fetching or processing.

## Skeleton Components

Skeleton components are placeholder UI elements that mimic the shape of the content that is loading. They provide visual feedback to users that content is being loaded, rather than showing a generic spinner or blank space.

### SkeletonText

`SkeletonText` displays animated placeholder text blocks.

```tsx
import { SkeletonText } from '../../components/ui/Skeleton';

function LoadingComponent() {
  return (
    <SkeletonText lines={3} className="mb-4" />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | number | 1 | Number of text lines to display |
| `width` | string | '100%' | Width of the skeleton text |
| `className` | string | '' | Additional CSS classes to apply |

### SkeletonImage

`SkeletonImage` displays an animated placeholder for images.

```tsx
import { SkeletonImage } from '../../components/ui/Skeleton';

function LoadingAvatar() {
  return (
    <SkeletonImage width="64px" height="64px" rounded="full" />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | string | '100%' | Width of the skeleton image |
| `height` | string | '200px' | Height of the skeleton image |
| `rounded` | 'none' \| 'sm' \| 'md' \| 'lg' \| 'full' | 'md' | Rounding of the corners |
| `className` | string | '' | Additional CSS classes to apply |

### SkeletonGrid

`SkeletonGrid` displays a grid of skeleton cards for list views.

```tsx
import { SkeletonGrid } from '../../components/ui/Skeleton';

function LoadingList() {
  return (
    <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | number | 6 | Number of skeleton items to display |
| `columns` | { sm?: number, md?: number, lg?: number } | { sm: 1, md: 2, lg: 3 } | Column configuration for different breakpoints |
| `cardProps` | object | {} | Props to pass to each SkeletonCard |
| `className` | string | '' | Additional CSS classes to apply |

### SkeletonCard

`SkeletonCard` displays a card placeholder with image and text elements.

```tsx
import { SkeletonCard } from '../../components/ui/Skeleton';

function LoadingCardItem() {
  return (
    <SkeletonCard imageHeight="150px" lines={3} />
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageHeight` | string | '200px' | Height of the image placeholder |
| `lines` | number | 4 | Number of text lines to display |
| `className` | string | '' | Additional CSS classes to apply |

## LoadingState Container

The `LoadingState` component provides a full-page loading experience for when entire pages are loading. Each page typically has its own LoadingState component that's customized for that page's layout.

### Example Implementation

```tsx
// EventDetailPage/LoadingState.tsx
import React from 'react';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonImage, SkeletonText } from '../../components/ui/Skeleton';

const LoadingState: React.FC = () => {
  return (
    <ContentContainer>
      <Card>
        <div className="p-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <SkeletonText lines={2} width="60%" />
            <div className="w-24 h-10 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse" />
          </div>
          
          {/* Hero image skeleton */}
          <SkeletonImage height="300px" className="mb-8" />
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <SkeletonText lines={6} className="mb-8" />
            </div>
            <div>
              <SkeletonText lines={4} />
            </div>
          </div>
        </div>
      </Card>
    </ContentContainer>
  );
};

export default LoadingState;
```

## Usage Pattern

For each page in the application, use the following pattern to handle loading states:

```tsx
function MyPage() {
  const { data, isLoading, error } = useMyData();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !data) {
    return <ErrorState />;
  }
  
  return (
    <ContentContainer>
      {/* Actual page content */}
    </ContentContainer>
  );
}
```

For list components that may have their own loading states:

```tsx
function MyListComponent() {
  const { data, isLoading, error } = useMyListData();
  
  if (isLoading) {
    return <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />;
  }
  
  if (error) {
    return <QueryError error={error} retry={refetch} />;
  }
  
  if (!data || data.length === 0) {
    return <EmptyState title="No items found" />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```
