# Error Handling Implementation Guide

## Quick Start

The Uluntu now uses a centralized error sanitization system to prevent exposure of sensitive internal information while providing excellent user experience.

## Basic Usage

### 1. Import Error Handling

```typescript
import { useSimpleError } from '@/hooks/useErrorHandling';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
```

### 2. Use in Components

```typescript
function MyComponent() {
  const { error, handleError, clearError } = useSimpleError('My Component');
  
  const handleSubmit = async () => {
    try {
      await someApiCall();
    } catch (err) {
      handleError(err); // Automatically sanitizes
    }
  };
  
  return (
    <div>
      {error && (
        <ErrorAlert 
          error={error} 
          onDismiss={clearError}
        />
      )}
      {/* Your component content */}
    </div>
  );
}
```

### 3. API Error Handling

```typescript
import { logAndSanitizeError } from '@/utils/errorSanitization';

async function apiFunction() {
  try {
    const response = await supabase.from('table').select();
    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    const sanitized = logAndSanitizeError(error, 'API Context');
    throw new Error(sanitized.userMessage);
  }
}
```

## Advanced Usage

### Error Handling with Retry

```typescript
import { useErrorHandling } from '@/hooks/useErrorHandling';

function ComponentWithRetry() {
  const { 
    error, 
    isRetrying, 
    handleError, 
    retry, 
    clearError,
    canRetry 
  } = useErrorHandling({
    context: 'Data Loading',
    autoRetry: true,
    maxRetries: 3
  });
  
  const fetchData = async () => {
    // Your data fetching logic
  };
  
  const handleRetry = () => {
    retry(fetchData);
  };
  
  return (
    <div>
      {error && (
        <ErrorAlert
          error={error}
          onRetry={canRetry ? handleRetry : undefined}
          onDismiss={clearError}
          isRetrying={isRetrying}
          canRetry={canRetry}
        />
      )}
    </div>
  );
}
```

### Form Error Handling

```typescript
import { useFormErrors } from '@/hooks/useErrorHandling';
import { FieldError } from '@/components/ui/ErrorAlert';

function MyForm() {
  const { 
    errors, 
    setFieldError, 
    clearFieldError, 
    hasError,
    getError 
  } = useFormErrors();
  
  const handleSubmit = async (formData) => {
    try {
      await submitForm(formData);
    } catch (err) {
      if (err.field) {
        setFieldError(err.field, err.message);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="email"
        onChange={() => clearFieldError('email')}
      />
      <FieldError error={getError('email')} />
      
      <input 
        name="password"
        onChange={() => clearFieldError('password')}
      />
      <FieldError error={getError('password')} />
    </form>
  );
}
```

## Error Categories

### Authentication Errors
- Invalid credentials → User-friendly login error
- Session expired → Clear session expiry message
- Email not confirmed → Verification reminder

### Database Errors
- Connection issues → "Service temporarily unavailable"
- Not found → "Item not found"
- Permission denied → "Access denied"

### Upload Errors
- File too large → Size limit message with specific limits
- Invalid type → Allowed types list
- Storage full → Storage limit reached message

## Best Practices

### 1. Always Use Context
Provide meaningful context for better debugging:

```typescript
// Good
logAndSanitizeError(error, 'User Profile - Update Avatar');

// Bad
logAndSanitizeError(error, 'Error');
```

### 2. Don't Re-throw Raw Errors
Always sanitize before re-throwing:

```typescript
// Good
catch (error) {
  const sanitized = logAndSanitizeError(error, context);
  throw new Error(sanitized.userMessage);
}

// Bad
catch (error) {
  throw error; // Exposes internal details
}
```

### 3. Use Appropriate Error Components
- `ErrorAlert` - For major errors that need user attention
- `InlineError` - For form field validation
- `FieldError` - For specific form field errors
- `ErrorToast` - For temporary notifications

### 4. Provide Actionable Messages
Error messages should tell users what they can do:

```typescript
// Good: "File is too large. Please choose a file smaller than 10MB."
// Bad: "File size exceeds maximum limit."
```

## Common Patterns

### API Wrapper Pattern
```typescript
class ApiService {
  private async request(endpoint: string, options: RequestInit) {
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      const sanitized = logAndSanitizeError(error, `API - ${endpoint}`);
      throw new Error(sanitized.userMessage);
    }
  }
}
```

### Hook Pattern
```typescript
function useDataFetching(url: string) {
  const { error, handleError, clearError } = useSimpleError('Data Fetching');
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(handleError);
  }, [url]);
  
  return { data, error, clearError };
}
```

## Migration Checklist

When updating existing error handling:

- [ ] Replace `console.error` with `logAndSanitizeError`
- [ ] Update error display to use new components
- [ ] Add meaningful context strings
- [ ] Test error scenarios to ensure no sensitive info exposed
- [ ] Verify debug information still available in logs
- [ ] Update tests to expect sanitized messages

## Testing Error Handling

### Unit Tests
```typescript
import { sanitizeError } from '@/utils/errorSanitization';

test('should sanitize database constraint errors', () => {
  const error = new Error('duplicate key value violates unique constraint "users_email_key"');
  const sanitized = sanitizeError(error);
  
  expect(sanitized.userMessage).not.toContain('users_email_key');
  expect(sanitized.userMessage).toContain('data conflicts');
});
```

### Integration Tests
```typescript
test('should handle auth errors gracefully', async () => {
  // Simulate auth error
  const mockError = new Error('Invalid login credentials');
  
  render(<SignInForm />);
  
  // Trigger error
  fireEvent.submit(screen.getByRole('form'));
  
  // Should show sanitized message
  expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  expect(screen.queryByText(/login credentials/i)).not.toBeInTheDocument();
});
```

## Debugging

### Finding Errors in Logs
1. Use the debug ID from user reports
2. Search logs for the debug ID
3. Full error context will be available in server logs

### Error Code Reference
- `AUTH_*` - Authentication related
- `DB_*` - Database operations
- `UPLOAD_*` - File upload issues
- `API_*` - General API errors
- `VAL_*` - Validation errors
- `GEN_*` - Generic/unknown errors

## Support

For questions about error handling implementation:
1. Check existing patterns in codebase
2. Review this guide and audit report
3. Test error scenarios thoroughly
4. Ensure no sensitive information is exposed