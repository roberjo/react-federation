# Testing Strategy

## Overview

This document outlines the testing strategy for the Enterprise Portal with Micro-Frontend Architecture. The strategy covers unit tests, integration tests, and end-to-end tests.

## Testing Philosophy

1. **Test Behavior, Not Implementation**: Focus on what components do, not how they do it
2. **Test User Interactions**: Test from the user's perspective
3. **Test Critical Paths**: Prioritize authentication, module loading, and data flow
4. **Fast Feedback**: Unit tests should run quickly
5. **Confidence**: Tests should give confidence that the system works

## Testing Pyramid

```
        /\
       /  \  E2E Tests (Few, Critical Paths)
      /____\
     /      \  Integration Tests (Module Federation, Auth Flow)
    /________\
   /          \  Unit Tests (Many, Components, Stores, Utils)
  /____________\
```

### Unit Tests (70%)
- **Scope**: Individual components, stores, utilities, services
- **Tools**: Vitest, React Testing Library
- **Speed**: Fast (< 1 second per test)
- **Coverage Target**: 80%+

### Integration Tests (20%)
- **Scope**: Component interactions, store integration, API integration
- **Tools**: Vitest, React Testing Library, MSW
- **Speed**: Medium (< 5 seconds per test)
- **Coverage Target**: Critical paths

### E2E Tests (10%)
- **Scope**: Full user flows (login, module loading, navigation)
- **Tools**: Playwright
- **Speed**: Slow (< 30 seconds per test)
- **Coverage Target**: Critical user journeys

## Testing Tools

### Unit & Integration Tests
- **Vitest**: Fast test runner, Vite-native
- **React Testing Library**: Component testing
- **MSW**: API mocking for integration tests
- **@testing-library/user-event**: User interaction simulation

### E2E Tests
- **Playwright**: Cross-browser E2E testing
- **MSW**: Mock services in E2E tests

## Test Structure

```
packages/
├── portal/
│   ├── src/
│   │   ├── components/
│   │   │   └── __tests__/
│   │   ├── stores/
│   │   │   └── __tests__/
│   │   └── services/
│   │       └── __tests__/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── trade-plans/
│   └── src/
│       └── components/
│           └── __tests__/
└── shared/
    └── src/
        └── __tests__/
```

## Test Categories

### 1. Unit Tests

#### Components
- Render correctly
- Handle user interactions
- Display correct data
- Handle loading/error states

#### Stores (MobX)
- State updates correctly
- Actions work as expected
- Computed values are correct
- Side effects are handled

#### Services
- API calls are made correctly
- Error handling works
- Data transformation is correct

#### Utilities
- Functions return expected values
- Edge cases are handled
- Error cases are handled

### 2. Integration Tests

#### Authentication Flow
- Login process works
- Token storage works
- User data loads correctly
- Logout works

#### Module Federation
- Remote modules load correctly
- Props injection works
- Error handling works
- Loading states work

#### API Integration
- API calls succeed
- Error handling works
- Data flows correctly
- Token injection works

### 3. E2E Tests

#### Critical User Journeys
1. **Login Flow**
   - User can login
   - User is redirected after login
   - User can access protected routes

2. **Module Loading**
   - User can navigate to module
   - Module loads correctly
   - Module receives auth props

3. **Navigation**
   - User can navigate between routes
   - Protected routes require auth
   - Unauthorized access is blocked

## Test Data

### Mock Users
```typescript
const mockUsers = {
  admin: { email: 'admin@example.com', groups: ['admins'] },
  trader: { email: 'trader@example.com', groups: ['traders'] },
  compliance: { email: 'compliance@example.com', groups: ['compliance-officers'] },
  sales: { email: 'sales@example.com', groups: ['sales-agents'] },
}
```

### Mock API Responses
- Use MSW handlers for consistent mock data
- Test both success and error cases
- Test edge cases (empty data, large datasets)

## Test Coverage Goals

- **Overall**: 80%+
- **Critical Paths**: 95%+
- **Components**: 80%+
- **Stores**: 90%+
- **Services**: 85%+
- **Utilities**: 90%+

## Running Tests

### Unit Tests
```bash
pnpm test              # Run all tests
pnpm test:portal       # Run portal tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

### Integration Tests
```bash
pnpm test:integration  # Run integration tests
```

### E2E Tests
```bash
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Run with UI
```

## CI/CD Integration

- Run tests on every PR
- Require tests to pass before merge
- Generate coverage reports
- Fail build if coverage drops below threshold

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Test names should describe what they test
3. **One Assertion Per Test**: Focus each test on one behavior
4. **Test Isolation**: Tests should not depend on each other
5. **Mock External Dependencies**: Don't test external services
6. **Test Edge Cases**: Test error conditions and edge cases
7. **Keep Tests Fast**: Avoid slow operations in unit tests
8. **Use MSW**: Mock API calls consistently

## Test Examples

### Component Test
```typescript
test('renders login button', () => {
  render(<LoginPage />)
  expect(screen.getByText('Sign In')).toBeInTheDocument()
})
```

### Store Test
```typescript
test('updates isAuthenticated on login', async () => {
  const store = new AuthStore(mockOktaAuth)
  await store.login()
  expect(store.isAuthenticated).toBe(true)
})
```

### Integration Test
```typescript
test('user can login and access module', async () => {
  render(<App />)
  await user.click(screen.getByText('Sign In'))
  // ... verify login flow
  await user.click(screen.getByText('Trade Plans'))
  // ... verify module loads
})
```

## Maintenance

- Review test coverage regularly
- Update tests when requirements change
- Remove obsolete tests
- Refactor tests for clarity
- Keep tests in sync with code

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

