# Marketplace Test Suite

This directory contains comprehensive tests for the marketplace system following Test-Driven Development (TDD) methodology.

## Test Structure

```
marketplace/
├── unit/                    # Isolated component and function tests
│   ├── marketplaceApi.test.ts      # API layer tests
│   └── marketplaceComponents.test.tsx # Component tests
├── integration/             # Component interaction tests
│   └── marketplaceFlow.test.tsx    # User workflow tests
├── e2e/                    # End-to-end tests
│   └── marketplaceE2E.test.tsx     # Complete user journeys
├── fixtures/               # Test data and mocks
│   └── marketplaceFixtures.ts      # Reusable test data
└── helpers/                # Test utilities
    └── testHelpers.ts              # Helper functions

```

## Coverage Requirements

All marketplace features must meet the following coverage targets:
- Unit tests: 95% coverage
- Integration tests: 90% coverage
- E2E tests: Critical user paths

## Running Tests

### Run all marketplace tests:
```bash
npm test src/tests/marketplace
```

### Run specific test suites:
```bash
# Unit tests only
npm test src/tests/marketplace/unit

# Integration tests only
npm test src/tests/marketplace/integration

# E2E tests (requires test server)
npm run test:e2e src/tests/marketplace/e2e
```

### Run with coverage:
```bash
npm test -- --coverage src/tests/marketplace
```

## Test Requirements Mapping

### MKT-001: Listing Creation
- Unit: `marketplaceApi.test.ts` - create() method
- Unit: `marketplaceComponents.test.tsx` - Form validation
- Integration: `marketplaceFlow.test.tsx` - Complete creation flow
- E2E: `marketplaceE2E.test.tsx` - Full user journey

### MKT-002: Listing Management
- Unit: `marketplaceApi.test.ts` - update(), delete() methods
- Integration: `marketplaceFlow.test.tsx` - Edit/delete flows
- E2E: `marketplaceE2E.test.tsx` - Management workflows

### MKT-003 & MKT-005: Seller Contact
- Unit: `marketplaceComponents.test.tsx` - ContactModal tests
- Integration: `marketplaceFlow.test.tsx` - Contact flow
- E2E: `marketplaceE2E.test.tsx` - Message sending

### MKT-004: Search & Filter
- Unit: `marketplaceApi.test.ts` - Filter application
- Unit: `marketplaceComponents.test.tsx` - Filter UI
- Integration: `marketplaceFlow.test.tsx` - Search workflows
- E2E: `marketplaceE2E.test.tsx` - User search experience

### MKT-006: Purchase (Placeholder)
- Integration: `marketplaceFlow.test.tsx` - Current behavior
- Note: Full implementation pending PRD clarification

## Test Data Management

### No Hardcoded Values
All test data is managed through fixtures:
- User data: `testUsers` in fixtures
- Listing data: `createTestListing()` factory
- API responses: `mockApiResponses`

### Environment Variables
Tests use mock environment variables:
```javascript
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
```

## Mocking Strategy

### API Mocking
- Supabase client is fully mocked
- All external API calls are intercepted
- Network errors are simulated for resilience testing

### Authentication Mocking
- `useAuth` hook returns test user data
- Different user roles can be simulated
- Session management is mocked

## Best Practices

1. **Test Independence**: Each test is self-contained
2. **Descriptive Names**: Test names clearly describe behavior
3. **Arrange-Act-Assert**: Clear test structure
4. **Mock Minimally**: Only mock external dependencies
5. **Test Behavior**: Focus on user-visible behavior
6. **Error Cases**: Always test error scenarios

## Debugging Tests

### Visual Debugging
```bash
# Run tests in watch mode
npm test -- --watch

# Debug specific test
npm test -- --debug marketplaceApi.test.ts
```

### Common Issues

1. **Async Issues**: Use `waitFor` for async operations
2. **State Leaks**: Clear mocks in `beforeEach`
3. **Timing Issues**: Use proper wait utilities
4. **Mock Conflicts**: Reset all mocks between tests

## CI/CD Integration

Tests are configured to run in CI with:
- Parallel execution for speed
- Coverage reporting to track progress
- Failure notifications
- Automatic retries for flaky tests

## Contributing

When adding new marketplace features:
1. Write failing tests first (Red)
2. Implement minimal code to pass (Green)
3. Refactor and optimize (Refactor)
4. Update this README with new test mappings