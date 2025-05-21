# Error Handling

The Kootenay Tech Community application implements a consistent approach to error handling across all pages and components to provide clear feedback to users when something goes wrong.

## Common Error Components

### QueryError

`QueryError` is the primary component for displaying errors related to data fetching or API requests.

```tsx
import { QueryError } from '../../components/ui/ErrorDisplay';

function MyComponent() {
  const { data, error, refetch } = useMyData();
  
  if (error) {
    return (
      <QueryError 
        error={error}
        message="We couldn't load the data. Please try again."
        retry={refetch}
      />
    );
  }
  
  return <div>{/* Your component content */}</div>;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | Error or unknown | required | The error object |
| `message` | string | 'An error occurred' | User-friendly error message |
| `retry` | function | undefined | Function to retry the operation |
| `className` | string | '' | Additional CSS classes to apply |

### NotFoundError

`NotFoundError` is used when a specific resource cannot be found, like when a user navigates to a non-existent item.

```tsx
import { NotFoundError } from '../../components/ui/ErrorDisplay';

function ItemDetailPage() {
  const { id } = useParams();
  const { data, error } = useItem(id);
  
  if (error?.status === 404 || !data) {
    return (
      <NotFoundError 
        title="Item Not Found"
        message="The item you're looking for doesn't exist or has been removed."
        backUrl="/items"
        backText="Back to Items"
      />
    );
  }
  
  return <div>{/* Item details */}</div>;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Not Found' | Main heading for the error |
| `message` | string | 'The resource you requested could not be found.' | Descriptive error message |
| `backUrl` | string | '/' | URL to navigate back to |
| `backText` | string | 'Back to Home' | Text for the back button |
| `className` | string | '' | Additional CSS classes to apply |

### FormError

`FormError` is used to display validation or submission errors within forms.

```tsx
import { FormError } from '../../components/ui/ErrorDisplay';

function MyForm() {
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (data) => {
    try {
      await submitData(data);
    } catch (err) {
      setError('Unable to submit the form. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <FormError message={error} onDismiss={() => setError(null)} />}
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | required | Error message to display |
| `onDismiss` | function | undefined | Function to dismiss the error |
| `className` | string | '' | Additional CSS classes to apply |

## Page-Level Error States

Each page should have its own `ErrorState` component that is customized for that page's context. The component should provide:

1. Clear explanation of what went wrong
2. Options for the user to resolve the issue
3. Consistent styling with the rest of the application

### Example Implementation

```tsx
// EventDetailPage/ErrorState.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';

interface ErrorStateProps {
  message?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = "We couldn't load the event details. The event may have been removed or is no longer available."
}) => {
  return (
    <ContentContainer>
      <Card>
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Event Not Found
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Back to Events
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Card>
    </ContentContainer>
  );
};

export default ErrorState;
```

## Error Handling Pattern

For each page in the application, use the following pattern to handle errors:

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

For components that need to handle errors internally:

```tsx
function MyComponent() {
  const { data, error, refetch } = useMyData();
  
  if (error) {
    return (
      <QueryError 
        error={error}
        message="We couldn't load the data. Please try again."
        retry={refetch}
      />
    );
  }
  
  return <div>{/* Component content */}</div>;
}
```

## Form Error Handling

For form validation errors, display specific error messages next to the relevant fields:

```tsx
function MyForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>
      
      {/* Other form fields */}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```
