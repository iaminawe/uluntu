# Testing Strategy Update: Redux and Supabase Integration

## Overview

This document outlines the updated testing strategy for the Nelson Tech platform, focusing on resolving issues with Redux and Supabase integration tests. It addresses the current blockers and provides a clear path forward for maintaining a robust testing framework.

## Current Issues

1. **Redux Integration Tests**:
   - Synchronization issues between Redux state and component state
   - Async operation handling in tests
   - Duplicate mocks causing conflicts

2. **Supabase Client Initialization**:
   - Environment variable handling in tests
   - Mock implementation inconsistencies

3. **Testing Utilities**:
   - Lack of standardized test utilities for common operations
   - Inconsistent approach to mocking

## Solutions and Implementation

### 1. Standardized Mock Strategy

To resolve the duplicate mock issues and ensure consistent behavior across tests, we've implemented:

- **Centralized Mock Files**:
  - `src/__mocks__/lib/supabase.ts`: Mock for the Supabase module
  - `src/__mocks__/lib/supabaseClient.ts`: Mock for the Supabase client
  - `src/__mocks__/context/SessionContext.tsx`: Mock for the SessionContext

- **Mock Implementation Guidelines**:
  - Each mock should have a clear, single responsibility
  - Mocks should be consistent with the actual implementation
  - Mocks should be easily configurable for different test scenarios

### 2. Environment Variable Handling

To address the issues with environment variables and `import.meta.env`:

- **Updated Jest Configuration**:
  - Added support for handling `import.meta.env` in tests
  - Standardized environment variable mocking across all tests

- **Setup Files Enhancement**:
  - Updated `setupTests.ts` to include mocks for browser APIs
  - Added consistent environment variable mocking

### 3. Redux Testing Approach

For testing Redux slices and hooks:

- **Slice Testing**:
  - Test reducers directly with known inputs and expected outputs
  - Test async thunks with mocked API calls
  - Verify selectors return expected values

- **Hook Testing**:
  - Use `renderHook` from `@testing-library/react-hooks` with proper Redux Provider wrapper
  - Test hook behavior in isolation from components
  - Verify state updates and side effects

### 4. Component Testing with Redux

For components that use Redux:

- **Test Store Setup**:
  - Create a test store with the necessary reducers
  - Initialize with a known state
  - Wrap components with the Provider

- **Async Testing**:
  - Use `act` and `waitFor` to handle async operations
  - Ensure state updates are complete before assertions
  - Mock Redux hooks to control behavior

### 5. Supabase Integration Testing

For testing components that interact with Supabase:

- **Mock Supabase Client**:
  - Use a consistent mock implementation
  - Configure mock responses for different test scenarios
  - Test error handling

- **Session Management**:
  - Test session initialization
  - Test authentication state changes
  - Verify proper synchronization between context and Redux

## Implementation Examples

### Redux Slice Test Example

```typescript
// contentSlice.test.ts
import contentReducer, {
  updatePageContent,
  updateSectionContent,
  changeLanguage
} from '../contentSlice';

describe('contentSlice', () => {
  it('should handle updatePageContent', () => {
    const initialState = {
      pages: { home: { title: { en: 'Home' } } },
      // other state properties
    };
    
    const action = updatePageContent({
      pageId: 'home',
      field: 'title',
      language: 'en',
      content: 'Updated Home'
    });
    
    const newState = contentReducer(initialState, action);
    expect(newState.pages.home.title.en).toBe('Updated Home');
  });
  
  // More tests for other actions and reducers
});
```

### Redux Hook Test Example

```typescript
// useContentRedux.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import contentReducer from '../../redux/slices/contentSlice';
import { useContentRedux } from '../useContentRedux';

const createTestStore = () => configureStore({
  reducer: { content: contentReducer }
});

const wrapper = ({ children }) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe('useContentRedux', () => {
  it('should initialize with default content', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useContentRedux(), { wrapper });
    
    await waitForNextUpdate();
    
    expect(result.current.pages).toBeDefined();
    expect(result.current.currentLanguage).toBe('en');
  });
  
  // More tests for other hook functionality
});
```

### Supabase Integration Test Example

```typescript
// SessionContextWithRedux.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../redux/slices/authSlice';
import { SessionProvider } from '../SessionContext';
import TestComponent from './TestComponent';

const createTestStore = () => configureStore({
  reducer: { auth: authReducer }
});

describe('SessionContext with Redux', () => {
  it('should sync session state with Redux', async () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('session-status')).toHaveTextContent('authenticated');
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });
  });
  
  // More tests for authentication flows
});
```

## Best Practices

1. **Test Isolation**:
   - Each test should be independent
   - Reset mocks and state between tests
   - Avoid test interdependencies

2. **Mock Consistency**:
   - Use the same mock implementation across related tests
   - Configure mocks for specific test scenarios
   - Document mock behavior

3. **Async Testing**:
   - Always use `act` for state updates
   - Use `waitFor` with reasonable timeouts
   - Handle promises properly

4. **Redux Testing**:
   - Test slice behavior directly
   - Test hooks with proper providers
   - Verify state synchronization

5. **Error Handling**:
   - Test both success and error scenarios
   - Verify error states are properly managed
   - Test recovery from errors

## Next Steps

1. **Complete Test Fixes**:
   - Fix remaining Redux integration tests
   - Update Supabase mock implementations
   - Ensure all tests pass consistently

2. **Enhance Test Coverage**:
   - Add tests for edge cases
   - Improve error handling tests
   - Add performance tests

3. **Documentation**:
   - Update testing documentation
   - Document mock implementations
   - Create examples for common testing patterns

4. **CI Integration**:
   - Ensure tests run in CI environment
   - Add test coverage reporting
   - Set up test failure alerts

## Conclusion

This testing strategy provides a comprehensive approach to resolving the current issues with Redux and Supabase integration tests. By implementing these solutions and following the best practices outlined, we can ensure a robust and maintainable testing framework for the Nelson Tech platform.
