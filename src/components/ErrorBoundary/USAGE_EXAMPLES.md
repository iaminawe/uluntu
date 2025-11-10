# Error Boundary Usage Examples

Practical examples of implementing error boundaries for different scenarios.

## Example 1: Basic Page Wrapping

**Before:**
```typescript
// pages/MenuManagementPage.tsx
const MenuManagementPage: React.FC = () => {
  return (
    <div>
      {/* Menu management content */}
    </div>
  );
};

export default MenuManagementPage;
```

**After:**
```typescript
// pages/MenuManagementPage.tsx
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { MenuErrorFallback } from '@/components/ErrorBoundary/FeatureSpecificFallbacks';

const MenuManagementPageContent: React.FC = () => {
  return (
    <div>
      {/* Menu management content */}
    </div>
  );
};

const MenuManagementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FeatureErrorBoundary
      featureName="Menu Management"
      fallback={
        <MenuErrorFallback
          onRetry={() => window.location.reload()}
          onGoBack={() => navigate('/admin')}
        />
      }
    >
      <MenuManagementPageContent />
    </FeatureErrorBoundary>
  );
};

export default MenuManagementPage;
```

## Example 2: Section-Level Error Boundary

Wrap a specific section of a page:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Header />

      <FeatureErrorBoundary featureName="User Analytics">
        <UserAnalyticsPanel />
      </FeatureErrorBoundary>

      <FeatureErrorBoundary featureName="Activity Feed">
        <ActivityFeedPanel />
      </FeatureErrorBoundary>

      <Footer />
    </div>
  );
};
```

## Example 3: Error Logging and Monitoring

With custom error callback for external monitoring:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

const CampaignManager: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to external service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature: 'Campaign Manager',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('Campaign Manager Error:', error, errorInfo);
    }
  };

  const navigate = useNavigate();

  return (
    <FeatureErrorBoundary
      featureName="Campaign Manager"
      onError={handleError}
      fallback={
        <div className="p-6 text-center">
          <h2>Campaign Manager Error</h2>
          <p>We encountered an error. Our team has been notified.</p>
          <button onClick={() => navigate('/admin')}>
            Go Back to Admin
          </button>
        </div>
      }
    >
      <CampaignManagerContent />
    </FeatureErrorBoundary>
  );
};
```

## Example 4: Auto-Reset on Prop Changes

Reset error boundary when navigation changes:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { useParams } from 'react-router-dom';

const EntityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <FeatureErrorBoundary
      featureName="Entity Details"
      resetKeys={[id]} // Reset error boundary when ID changes
      onReset={() => {
        console.log(`Navigated to entity: ${id}`);
        // Clear any related state
      }}
    >
      <EntityContent entityId={id!} />
    </FeatureErrorBoundary>
  );
};
```

## Example 5: Nested Error Boundaries

Handle errors at multiple levels:

```typescript
const AdminPanel: React.FC = () => {
  return (
    <FeatureErrorBoundary featureName="Admin Panel">
      <div className="admin-panel">
        {/* Specific error handling for each section */}

        <FeatureErrorBoundary featureName="User Management">
          <UserManagementSection />
        </FeatureErrorBoundary>

        <FeatureErrorBoundary featureName="Settings">
          <SettingsSection />
        </FeatureErrorBoundary>

        <FeatureErrorBoundary featureName="Reports">
          <ReportsSection />
        </FeatureErrorBoundary>
      </div>
    </FeatureErrorBoundary>
  );
};
```

## Example 6: Custom Fallback UI

Create a custom error fallback:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const CustomErrorFallback: React.FC<{
  featureName: string;
  error?: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
}> = ({ featureName, error, onRetry, onGoHome }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">
            {featureName} Error
          </h1>
        </div>

        {error && (
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
        )}

        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              <Home size={18} />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Usage
const MyFeature: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FeatureErrorBoundary
      featureName="My Feature"
      fallback={
        <CustomErrorFallback
          featureName="My Feature"
          onRetry={() => window.location.reload()}
          onGoHome={() => navigate('/')}
        />
      }
    >
      <FeatureContent />
    </FeatureErrorBoundary>
  );
};
```

## Example 7: Error Boundary with Retry Logic

Implement retry logic with backoff:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

const DataGridWithRetry: React.FC = () => {
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      // Trigger a re-render by resetting the error boundary
      window.location.reload();
    } else {
      alert('Maximum retries reached. Please contact support.');
    }
  };

  return (
    <FeatureErrorBoundary
      featureName="Data Grid"
      resetKeys={[retryCount]}
    >
      <ComplexDataGrid />
    </FeatureErrorBoundary>
  );
};
```

## Example 8: Integration with React Query

Error boundary with data fetching:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { useQuery } from '@tanstack/react-query';

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  // Error boundary for rendering errors
  return (
    <FeatureErrorBoundary
      featureName="User List"
      fallback={
        <div className="p-6">
          <h2>Failed to load users</h2>
          <p>An unexpected error occurred.</p>
          <button onClick={() => refetch()}>Retry</button>
          <button onClick={() => navigate('/admin')}>Go Back</button>
        </div>
      }
    >
      {/* React Query errors are handled separately in this layer */}
      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p>Failed to load user data: {error.message}</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {data && <UserList users={data} />}
    </FeatureErrorBoundary>
  );
};
```

## Example 9: Testing Error Boundaries

Unit test for error boundary:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';

// Component that throws an error
const ErrorComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Content</div>;
};

describe('FeatureErrorBoundary', () => {
  // Suppress console.error for these tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders children when no error', () => {
    render(
      <FeatureErrorBoundary featureName="Test">
        <ErrorComponent shouldThrow={false} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders fallback UI when error occurs', () => {
    render(
      <FeatureErrorBoundary featureName="Test Feature">
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText(/Error in Test Feature/i)).toBeInTheDocument();
  });

  test('calls onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <FeatureErrorBoundary
        featureName="Test"
        onError={onError}
      >
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom Error UI</div>;

    render(
      <FeatureErrorBoundary
        featureName="Test"
        fallback={customFallback}
      >
        <ErrorComponent shouldThrow={true} />
      </FeatureErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });
});
```

## Example 10: Multi-Language Support

Error boundary with i18n support:

```typescript
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslation } from 'react-i18next';

const LocalizedErrorFallback: React.FC<{
  featureName: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}> = ({ featureName, onRetry, onGoBack }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 text-center">
      <h2>{t('error.title', { feature: featureName })}</h2>
      <p>{t('error.message')}</p>
      <div className="flex gap-2 justify-center">
        {onRetry && (
          <button onClick={onRetry}>
            {t('error.retry')}
          </button>
        )}
        {onGoBack && (
          <button onClick={onGoBack}>
            {t('error.goBack')}
          </button>
        )}
      </div>
    </div>
  );
};

const LocalizedFeature: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <FeatureErrorBoundary
      featureName={t('features.myFeature')}
      fallback={
        <LocalizedErrorFallback
          featureName={t('features.myFeature')}
          onRetry={() => window.location.reload()}
          onGoBack={() => navigate('/admin')}
        />
      }
    >
      <FeatureContent />
    </FeatureErrorBoundary>
  );
};
```

## Common Patterns

### Pattern 1: Error Boundary with Loading State

```typescript
const [isLoading, setIsLoading] = useState(true);

return (
  <FeatureErrorBoundary featureName="Data">
    {isLoading ? <LoadingSpinner /> : <DataContent />}
  </FeatureErrorBoundary>
);
```

### Pattern 2: Error Boundary with Permission Check

```typescript
return (
  <FeatureErrorBoundary featureName="Admin Panel">
    {hasPermission ? <AdminContent /> : <PermissionDenied />}
  </FeatureErrorBoundary>
);
```

### Pattern 3: Error Boundary with Data Validation

```typescript
return (
  <FeatureErrorBoundary featureName="Form">
    {isValidData ? <FormContent /> : <InvalidDataError />}
  </FeatureErrorBoundary>
);
```

## Migration Guide

To add error boundaries to an existing feature:

1. **Rename the original component:**
   ```typescript
   // Before
   const MyPage: React.FC = () => { ... }

   // After
   const MyPageContent: React.FC = () => { ... }
   ```

2. **Add imports:**
   ```typescript
   import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
   import { CustomErrorFallback } from '@/components/ErrorBoundary/FeatureSpecificFallbacks';
   ```

3. **Create wrapper component:**
   ```typescript
   const MyPage: React.FC = () => {
     const navigate = useNavigate();

     return (
       <FeatureErrorBoundary
         featureName="My Page"
         fallback={<CustomErrorFallback onGoBack={() => navigate('/admin')} />}
       >
         <MyPageContent />
       </FeatureErrorBoundary>
     );
   };
   ```

4. **Export as before:**
   ```typescript
   export default MyPage;
   ```

5. **Test thoroughly** to ensure no regressions.
