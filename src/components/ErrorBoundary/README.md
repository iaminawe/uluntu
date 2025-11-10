# Error Boundary Components

Reusable error boundary components for graceful failure handling across critical features.

## Overview

This directory contains React error boundary components that catch unhandled errors and display user-friendly fallback UIs. Error boundaries allow applications to gracefully handle failures without crashing the entire app.

## Components

### FeatureErrorBoundary

The main reusable error boundary component for wrapping critical features.

**Props:**
- `featureName` (string, required): The name of the feature being wrapped (used for logging and display)
- `fallback` (React.ReactNode, optional): Custom fallback UI to display when an error occurs
- `onError` (function, optional): Callback function called when an error is caught
- `onReset` (function, optional): Callback function called when error boundary resets
- `resetKeys` (array, optional): Array of values that trigger automatic reset when changed
- `children` (React.ReactNode, required): Child components to protect

**Basic Usage:**

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

<FeatureErrorBoundary featureName="My Feature">
  <MyComponent />
</FeatureErrorBoundary>
```

**With Custom Fallback:**

```typescript
<FeatureErrorBoundary
  featureName="Menu Management"
  fallback={<CustomErrorUI />}
>
  <MenuComponent />
</FeatureErrorBoundary>
```

**With Error Callback:**

```typescript
<FeatureErrorBoundary
  featureName="User Settings"
  onError={(error, errorInfo) => {
    // Send to error tracking service
    console.error('Error caught:', error);
  }}
>
  <SettingsComponent />
</FeatureErrorBoundary>
```

**With Auto-Reset:**

```typescript
<FeatureErrorBoundary
  featureName="Dashboard"
  resetKeys={[userId, currentPage]}
  onReset={() => console.log('Error boundary reset')}
>
  <DashboardComponent />
</FeatureErrorBoundary>
```

### Feature-Specific Fallbacks

Pre-built fallback components for different feature types:

#### MenuErrorFallback
For menu management features. Shows relevant context about menu errors.

```typescript
<MenuErrorFallback
  error={error}
  onRetry={handleRetry}
  onGoBack={() => navigate('/admin')}
/>
```

#### SettingsErrorFallback
For settings/configuration features. Reassures users their settings are safe.

```typescript
<SettingsErrorFallback
  error={error}
  onRetry={handleRetry}
  onGoBack={() => window.history.back()}
/>
```

#### UsersErrorFallback
For user management features. Confirms user data hasn't been modified.

```typescript
<UsersErrorFallback
  error={error}
  onRetry={handleRetry}
  onGoBack={() => navigate('/admin')}
/>
```

#### NewsletterErrorFallback
For newsletter/campaign management. Informs users about draft preservation.

```typescript
<NewsletterErrorFallback
  error={error}
  onRetry={handleRetry}
  onGoBack={() => navigate('/campaigns')}
/>
```

#### GalleryErrorFallback
For gallery/media management features.

```typescript
<GalleryErrorFallback
  error={error}
  onRetry={handleRetry}
  onGoBack={() => navigate('/gallery')}
/>
```

#### AdminErrorFallback
Generic error fallback for admin pages.

```typescript
<AdminErrorFallback
  error={error}
  onRetry={handleRetry}
  onGoBack={() => navigate('/admin')}
/>
```

## Implementation Patterns

### Pattern 1: Wrap Entire Page

```typescript
// pages/MyPage.tsx

const MyPageContent: React.FC = () => {
  // Original component logic here
  return <div>...</div>;
};

const MyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FeatureErrorBoundary
      featureName="My Feature"
      fallback={<CustomErrorFallback onGoBack={() => navigate('/admin')} />}
    >
      <MyPageContent />
    </FeatureErrorBoundary>
  );
};

export default MyPage;
```

### Pattern 2: Wrap Specific Component Section

```typescript
<div>
  <Header />
  <FeatureErrorBoundary featureName="Data Grid">
    <ComplexDataGrid />
  </FeatureErrorBoundary>
  <Footer />
</div>
```

### Pattern 3: Multiple Error Boundaries

Nest error boundaries at different levels to handle errors at appropriate scope:

```typescript
<FeatureErrorBoundary featureName="Admin Panel">
  <AdminLayout>
    <FeatureErrorBoundary featureName="User Management">
      <UserManagementSection />
    </FeatureErrorBoundary>

    <FeatureErrorBoundary featureName="Settings">
      <SettingsSection />
    </FeatureErrorBoundary>
  </AdminLayout>
</FeatureErrorBoundary>
```

## Features

### Error Catching and Logging

Errors are automatically caught and logged with context:

```typescript
// Logged as:
{
  featureName: "Menu Management",
  errorMessage: "Cannot read property 'id' of undefined",
  errorStack: "...",
  componentStack: "...",
  resetCount: 0
}
```

### User-Friendly Fallback UI

Default fallback displays:
- Clear error message
- Feature name
- Action buttons (Try Again, Reload Page, Go Back)
- Technical details (development only)
- Helpful guidance

### Error Recovery/Retry

Users can:
- Click "Try Again" to retry the component
- Click "Reload Page" to reload the entire page
- Click "Go Back" to navigate to previous location
- Click feature-specific actions in custom fallbacks

### Development vs Production

In development mode (`import.meta.env.DEV`):
- Full stack traces are displayed
- Component stack information is shown
- Detailed error messages are visible

In production:
- Only user-friendly messages are shown
- Technical details are hidden
- Error IDs are provided for support

## Wrapped Features

The following critical features are wrapped with error boundaries:

1. **Menu Management** (`/src/pages/admin/MenuManagementPage.tsx`)
   - Error Boundary: FeatureErrorBoundary
   - Fallback: MenuErrorFallback

2. **User Settings** (`/src/pages/UserSettingsPage.tsx`)
   - Error Boundary: FeatureErrorBoundary
   - Fallback: SettingsErrorFallback

3. **User Management** (`/src/pages/admin/SimpleUnifiedUsersPage/index.tsx`)
   - Error Boundary: FeatureErrorBoundary
   - Fallback: UsersErrorFallback

4. **Campaign Manager** (`/src/pages/admin/newsletter/CampaignManager.tsx`)
   - Error Boundary: FeatureErrorBoundary
   - Fallback: NewsletterErrorFallback

5. **Gallery Detail** (`/src/pages/GalleryDetailPage/index.tsx`)
   - Error Boundary: FeatureErrorBoundary
   - Fallback: GalleryErrorFallback

6. **Gallery Editor** (`/src/pages/GalleryEditPage/index.tsx`)
   - Error Boundary: FeatureErrorBoundary
   - Fallback: GalleryErrorFallback

## Best Practices

### DO

- Place error boundaries at feature/page level, not component level
- Provide meaningful `featureName` values for better debugging
- Use feature-specific fallbacks when available
- Log errors with context using the `onError` callback
- Test error boundaries with intentional errors
- Provide clear action buttons in fallback UIs

### DON'T

- Don't use error boundaries for all components (too granular)
- Don't rely on error boundaries for expected errors (use try-catch)
- Don't catch errors in the error boundary itself
- Don't use error boundaries for form validation (not their purpose)
- Don't forget to export original component content separately for testing

## Testing Error Boundaries

### Intentional Error Testing

Create a test component to intentionally throw errors:

```typescript
const ErrorTestButton: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  );
};
```

### Testing Fallback UI

```typescript
test('displays fallback UI when error occurs', () => {
  const { getByText } = render(
    <FeatureErrorBoundary featureName="Test Feature">
      <ErrorTestButton />
    </FeatureErrorBoundary>
  );

  const button = getByText('Trigger Error');
  fireEvent.click(button);

  expect(getByText(/Error in Test Feature/i)).toBeInTheDocument();
});
```

### Testing Error Callbacks

```typescript
test('calls onError callback when error occurs', () => {
  const onError = jest.fn();

  render(
    <FeatureErrorBoundary
      featureName="Test"
      onError={onError}
    >
      <ErrorTestButton />
    </FeatureErrorBoundary>
  );

  expect(onError).toHaveBeenCalled();
});
```

## Limitations

Error boundaries have some important limitations:

### Cannot Catch

- Event handler errors (use try-catch)
- Asynchronous code errors (setTimeout, promises)
- Server-side rendering errors
- Errors in the error boundary itself
- Errors during rendering of the error boundary

### For These, Use

```typescript
// Event handlers
const handleClick = () => {
  try {
    // Code that might throw
  } catch (error) {
    // Handle error
  }
};

// Async code
const loadData = async () => {
  try {
    const data = await fetchData();
  } catch (error) {
    setError(error);
  }
};
```

## Integration with Error Tracking

### Example: Integration with Sentry

```typescript
<FeatureErrorBoundary
  featureName="Menu Management"
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      extra: {
        featureName: 'Menu Management',
      },
    });
  }}
>
  <MenuComponent />
</FeatureErrorBoundary>
```

## Future Enhancements

Potential improvements:

1. Error recovery strategies (automatic retry with backoff)
2. Error reporting UI (built-in contact support)
3. Error analytics dashboard
4. Automatic error grouping
5. Feature-specific error context
6. Error boundary health monitoring
7. Fallback UI customization themes

## Contributing

When adding new error boundaries:

1. Create a feature-specific fallback component
2. Add to `FeatureSpecificFallbacks.tsx`
3. Export from `index.ts`
4. Document in this README
5. Add tests for fallback UI
6. Update the wrapped features list

## Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Error_Handling)
- [User Experience with Error Boundaries](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)
