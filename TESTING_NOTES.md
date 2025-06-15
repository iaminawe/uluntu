# Testing Configuration Notes

## Environment Setup

The application is configured to use different settings for development and testing:

### Development Environment (.env)
- `VITE_USE_SUPABASE=true` - Uses real Supabase database
- Connected to production Supabase instance

### Test Environment (.env.test)
- `VITE_USE_SUPABASE=false` - Uses mock data for consistent testing
- Tests should not depend on external services

## Why Tests Use Mocks

1. **Consistency**: Tests should produce the same results every time
2. **Speed**: Mock data is faster than database queries
3. **Isolation**: Tests shouldn't affect real data
4. **No Dependencies**: Tests can run without Supabase being available

## Running Tests

```bash
# Run all tests (uses mocks)
npm test

# Run specific test file
npm test src/components/admin/__tests__/EntityTable.test.tsx

# Run tests in watch mode
npm run test:watch
```

## Current Test Status

- Total Tests: 420
- Passing: 389 (92.6%)
- Failing: 9
- Skipped: 22

## Known Issues

1. Some EntityTable tests have timing issues
2. A few integration tests need updating for the current schema
3. Some old test files in src/tests/ directory need migration

## Best Practices

1. Always mock external dependencies in unit tests
2. Use integration tests sparingly for critical paths
3. Keep test files co-located with components
4. Maintain test coverage above 90%