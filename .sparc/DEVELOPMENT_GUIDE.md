# SPARC Development Guide

## Development Priorities Status

### ✅ Completed Priorities

1. **Priority 1: Testing Infrastructure & Auth** ✅
   - Fixed Jest configuration for TypeScript/JSX
   - Confirmed existing Redux-based auth system
   - Removed redundant auth template

2. **Priority 2: Core API Implementation** ✅
   - Fixed type mismatches in API layer
   - Implemented missing API methods
   - Resolved import and routing issues

3. **Priority 3: Event Management System** ✅
   - Event registration/unregistration flow
   - Attendee management for organizers
   - Event discovery with search/filters
   - Complete event detail views

4. **Priority 4: Marketplace System** ✅
   - Contact information management
   - User-member relationship fixes
   - Form validation
   - Enhanced buyer-seller communication

### 🚀 Next Priority

5. **Priority 5: Groups Management**
   - Review current implementation
   - Implement missing group features
   - Add group event integration
   - Enhance member management

## Key Development Patterns

### API Development
```typescript
// Standard API method pattern
async methodName(params): Promise<ReturnType | null> {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('field', value);
      
    if (error) {
      handleSupabaseError(error, 'context');
      return null;
    }
    
    return data ? adaptFromDatabase(data) : null;
  } catch (error) {
    handleSupabaseError(error, 'context');
    return null;
  }
}
```

### React Query Hooks
```typescript
export function useResourceName(): UseQueryResult<Type[], Error> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  
  return useQuery<Type[], Error>({
    queryKey: ['resource', useSupabase ? 'supabase' : 'mock'],
    queryFn: async () => {
      if (useSupabase) {
        return await api.getAll();
      } else {
        return mockData;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // Hooks
  const { data, isLoading } = useCustomHook();
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  // Conditional renders
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

## Database Migration Pattern

```sql
/*
  # Migration Title
  
  1. Changes
    - List of changes
    
  2. Security
    - RLS policies
*/

-- SQL implementation
ALTER TABLE table_name
ADD COLUMN column_name TYPE;

-- RLS policies
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  USING (condition);
```

## Testing Approach

### Unit Tests
```typescript
describe('Feature', () => {
  it('should behavior description', async () => {
    // Arrange
    const input = prepareTestData();
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Integration Tests
- Use MSW for API mocking
- Test full user workflows
- Verify Redux state updates

## Common Pitfalls & Solutions

### TypeScript Errors
- **import.meta.env**: Ensure vite-env.d.ts is included
- **Type mismatches**: Check adapters for proper conversion
- **Null/undefined**: Use optional chaining and nullish coalescing

### Supabase Issues
- **RLS errors**: Check policies for current table
- **FK constraints**: Ensure related records exist
- **Type generation**: Run `supabase gen types typescript`

### React Query
- **Stale closures**: Use queryClient.invalidateQueries
- **Race conditions**: Use mutation.mutateAsync with await
- **Cache keys**: Include all dependencies in queryKey

## Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Type Check**
   ```bash
   npx tsc --noEmit
   ```

4. **Database Migration**
   ```bash
   supabase migration new migration_name
   supabase db push
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Environment Variables

```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional
VITE_USE_SUPABASE=true  # Use 'false' for mock data
```

## Code Style Guidelines

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Tailwind CSS for styling
- Follow ESLint rules
- Write self-documenting code
- Add JSDoc comments for complex logic

## Performance Considerations

- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load routes with React.lazy
- Optimize images with next-gen formats
- Use React Query for server state

## Security Best Practices

- Never expose sensitive keys
- Validate all user inputs
- Use RLS policies for data access
- Sanitize HTML content
- Implement rate limiting
- Log security events

## Future Enhancements

### High Priority
- Image upload to Supabase Storage
- Real-time notifications
- Email integration

### Medium Priority
- Mobile app with React Native
- Advanced analytics dashboard
- Internationalization (i18n)

### Low Priority
- AI-powered content recommendations
- Blockchain integration for marketplace
- Virtual reality event spaces