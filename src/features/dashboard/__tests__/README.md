# User Dashboard Test Suite

Comprehensive testing suite for the user dashboard system, covering component testing, API testing, integration testing, security testing, and end-to-end testing.

## Test Structure

```
src/features/dashboard/__tests__/
├── setup/
│   ├── testConfig.ts          # Test configuration and utilities
│   └── setupTests.ts          # Test environment setup
├── unit/
│   └── UserDashboard.test.tsx # Component unit tests
├── api/
│   └── userDashboardApi.test.ts # API endpoint tests
├── integration/
│   ├── dashboardNavigation.test.tsx # Navigation integration tests
│   └── photoGalleryMigration.test.ts # Gallery migration tests
├── security/
│   └── userPermissions.test.ts # Security and permissions tests
├── e2e/
│   ├── userWorkflow.spec.ts   # End-to-end user workflows
│   └── crossBrowserCompatibility.spec.ts # Cross-browser tests
└── README.md                  # This file
```

## Test Categories

### 1. Component Tests (`UserDashboard.test.tsx`)

**Coverage:** Dashboard component rendering, tab switching, content management, analytics display, activity streams

**Key Features Tested:**
- Dashboard layout and responsive design
- Tab navigation and state management
- Content filtering and sorting
- Analytics visualization
- Activity feed interactions
- Error handling and loading states
- Accessibility compliance

**Running Tests:**
```bash
npm test -- --testPathPattern="UserDashboard.test.tsx"
```

### 2. API Tests (`userDashboardApi.test.ts`)

**Coverage:** User content retrieval, analytics endpoints, activity streams, content operations

**Key Features Tested:**
- User content fetching and filtering
- Analytics data processing
- Activity stream management
- Content CRUD operations
- Error handling and retry logic
- Performance and caching
- Real-time updates

**Running Tests:**
```bash
npm test -- --testPathPattern="userDashboardApi.test.ts"
```

### 3. Integration Tests

#### Navigation Integration (`dashboardNavigation.test.tsx`)

**Coverage:** Dashboard routing, navigation state, URL synchronization, breadcrumbs

**Key Features Tested:**
- Route-based navigation
- Deep linking support
- Browser back/forward navigation
- Navigation guards and permissions
- Mobile navigation patterns
- Performance optimization

#### Photo Gallery Migration (`photoGalleryMigration.test.ts`)

**Coverage:** Legacy photo gallery migration to dashboard

**Key Features Tested:**
- Legacy content detection
- Data migration processes
- Storage file migration
- Data integrity validation
- Rollback mechanisms
- Performance optimization

**Running Integration Tests:**
```bash
npm test -- --testPathPattern="integration/"
```

### 4. Security Tests (`userPermissions.test.ts`)

**Coverage:** User permissions, data security, session management, audit logging

**Key Features Tested:**
- Role-based access control
- Content access permissions
- Input validation and sanitization
- Session security
- API security measures
- Audit logging
- Rate limiting

**Running Security Tests:**
```bash
npm test -- --testPathPattern="security/"
```

### 5. End-to-End Tests

#### User Workflow (`userWorkflow.spec.ts`)

**Coverage:** Complete user journeys through the dashboard

**Key Features Tested:**
- Login to dashboard access
- Content creation workflows
- Analytics viewing and interaction
- Activity stream management
- Photo gallery integration
- Performance benchmarks
- Error recovery flows

#### Cross-Browser Compatibility (`crossBrowserCompatibility.spec.ts`)

**Coverage:** Dashboard functionality across different browsers and devices

**Key Features Tested:**
- Chrome, Firefox, Safari compatibility
- Mobile device responsiveness
- Touch interactions
- Performance across browsers
- Accessibility compliance
- Data consistency

**Running E2E Tests:**
```bash
npx playwright test --config=src/features/dashboard/__tests__/setup/testConfig.ts
```

## Test Data and Mocking

### Mock Data
The test suite uses comprehensive mock data located in `testConfig.ts`:
- User profiles (member, moderator, admin)
- Content items (posts, photos, events)
- Analytics data and metrics
- Activity streams and notifications

### API Mocking
API responses are mocked using:
- Jest mocks for unit/integration tests
- MSW (Mock Service Worker) for realistic API simulation
- Playwright route interception for E2E tests

## Coverage Requirements

### Minimum Coverage Thresholds
- **Components:** 85% (statements, branches, functions, lines)
- **API Layer:** 90% (statements, branches, functions, lines)
- **Overall:** 80% (statements, branches, functions, lines)

### Coverage Reports
```bash
npm run test:coverage -- --testPathPattern="dashboard"
```

## Performance Testing

### Performance Thresholds
- Page Load: < 3 seconds
- Tab Switching: < 1 second
- API Response: < 2 seconds
- Chart Rendering: < 1.5 seconds

### Core Web Vitals
- First Contentful Paint (FCP): < 2 seconds
- Largest Contentful Paint (LCP): < 3 seconds
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

## Accessibility Testing

### Standards Compliance
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements
- Focus management

### Accessibility Tools
- jest-axe for automated accessibility testing
- Lighthouse accessibility audits
- Manual keyboard navigation testing

## Running Tests

### All Dashboard Tests
```bash
npm test -- --testPathPattern="dashboard"
```

### Specific Test Categories
```bash
# Component tests only
npm test -- --testPathPattern="dashboard.*component"

# API tests only
npm test -- --testPathPattern="dashboard.*api"

# Integration tests only
npm test -- --testPathPattern="dashboard.*integration"

# Security tests only
npm test -- --testPathPattern="dashboard.*security"
```

### E2E Tests
```bash
# All E2E tests
npx playwright test

# Specific browser
npx playwright test --project=chromium

# Mobile tests
npx playwright test --project="Mobile Chrome"

# Debug mode
npx playwright test --debug
```

### Watch Mode
```bash
npm test -- --watch --testPathPattern="dashboard"
```

## Test Environment Setup

### Prerequisites
1. Node.js 18+ installed
2. All dependencies installed (`npm install`)
3. Test database seeded
4. Environment variables configured

### Environment Variables
```bash
# .env.test
REACT_APP_SUPABASE_URL=http://localhost:54321
REACT_APP_SUPABASE_ANON_KEY=your-test-anon-key
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### Database Setup
```bash
# Reset test database
npm run db:reset:test

# Seed test data
npm run db:seed:test
```

## Debugging Tests

### Jest Tests
```bash
# Debug specific test
npm test -- --testNamePattern="specific test name" --verbose

# Run with coverage
npm test -- --coverage --testPathPattern="dashboard"
```

### Playwright Tests
```bash
# Debug mode with browser
npx playwright test --debug

# Show browser during test
npx playwright test --headed

# Generate trace
npx playwright test --trace on
```

## Continuous Integration

### GitHub Actions
The test suite is configured to run in CI/CD pipelines:

```yaml
- name: Run Dashboard Tests
  run: |
    npm test -- --testPathPattern="dashboard" --coverage
    npx playwright test
```

### Test Reports
- Jest: HTML coverage reports in `coverage/`
- Playwright: HTML reports in `playwright-report/`
- Screenshots: Saved in `test-results/`

## Best Practices

### Writing Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should explain behavior
3. **Test One Thing**: Each test should verify one behavior
4. **Mock External Dependencies**: Keep tests isolated
5. **Use Test Data Builders**: Create reusable test data factories

### Test Maintenance
1. **Regular Updates**: Keep tests updated with feature changes
2. **Remove Flaky Tests**: Fix or remove unreliable tests
3. **Performance Monitoring**: Watch for slow tests
4. **Coverage Analysis**: Ensure adequate test coverage

### Security Testing
1. **Input Validation**: Test with malicious inputs
2. **Permission Boundaries**: Verify access controls
3. **Session Security**: Test authentication flows
4. **Data Sanitization**: Verify output encoding

## Troubleshooting

### Common Issues

1. **Tests Timeout**
   - Increase timeout values in test configuration
   - Check for infinite loops or blocking operations
   - Verify async/await usage

2. **Mock Not Working**
   - Ensure mocks are properly cleared between tests
   - Check mock implementation paths
   - Verify mock data structure

3. **E2E Tests Failing**
   - Check application is running on correct port
   - Verify test data is properly seeded
   - Review browser compatibility

4. **Coverage Issues**
   - Check ignore patterns in configuration
   - Verify all code paths are tested
   - Review branch coverage reports

### Getting Help
- Check test output for detailed error messages
- Review test configuration in `testConfig.ts`
- Consult Jest and Playwright documentation
- Check project's testing guidelines

## Contributing

### Adding New Tests
1. Follow existing test structure and patterns
2. Add appropriate test categories (unit, integration, e2e)
3. Update coverage thresholds if needed
4. Document new test scenarios
5. Ensure tests pass in CI environment

### Test Review Checklist
- [ ] Tests follow project conventions
- [ ] Adequate test coverage
- [ ] No flaky or slow tests
- [ ] Proper error handling tested
- [ ] Accessibility considerations included
- [ ] Security scenarios covered
- [ ] Documentation updated

This comprehensive test suite ensures the user dashboard system is reliable, secure, and accessible across all supported platforms and browsers.