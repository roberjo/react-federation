# Testing Guide

## Overview

This guide covers the testing setup and how to run tests for the Enterprise Portal with Micro-Frontend Architecture.

## Testing Stack

- **Vitest**: Fast unit and integration test runner (Vite-native)
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing
- **MSW**: API mocking for integration tests
- **jsdom**: DOM environment for tests

## Test Structure

```
packages/
├── portal/
│   ├── src/
│   │   ├── components/
│   │   │   └── __tests__/
│   │   ├── stores/
│   │   │   └── __tests__/
│   │   ├── services/
│   │   │   └── __tests__/
│   │   └── tests/
│   │       └── e2e/          # Playwright E2E tests
│   └── vitest.config.ts
└── trade-plans/
    └── src/
        └── components/
            └── __tests__/
```

## Running Tests

### All Tests

```bash
# Run all tests from root
pnpm test

# Run tests for specific package
pnpm test:portal
pnpm test:trade-plans
```

### Unit Tests

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui
```

## Test Coverage

### Current Coverage

- **Portal**: 24 tests passing
  - AuthStore: 8 tests
  - LoginPage: 4 tests
  - SecureRoute: 5 tests
  - ManifestService: 7 tests

- **Trade Plans**: 5 tests passing
  - TradeList: 5 tests

### Coverage Goals

- Overall: 80%+
- Critical Paths: 95%+
- Components: 80%+
- Stores: 90%+

## Writing Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Store Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MyStore } from '../MyStore'

describe('MyStore', () => {
  let store: MyStore

  beforeEach(() => {
    store = new MyStore()
  })

  it('should update state', () => {
    store.setValue('test')
    expect(store.value).toBe('test')
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Login Flow', () => {
  it('should login user', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.click(screen.getByText('Sign In'))
    
    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument()
    })
  })
})
```

## Mocking

### Mock Okta Auth

The project uses a mock Okta service for testing. See `packages/portal/src/services/mockOktaService.ts`.

### Mock API Calls

Use MSW handlers for API mocking:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/trades', () => {
    return HttpResponse.json({ trades: [] })
  }),
]
```

## Test Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Test names should describe what they test
3. **One Assertion Per Test**: Focus each test on one behavior
4. **Test Isolation**: Tests should not depend on each other
5. **Mock External Dependencies**: Don't test external services
6. **Test Edge Cases**: Test error conditions and edge cases
7. **Keep Tests Fast**: Avoid slow operations in unit tests

## Troubleshooting

### Tests Failing

1. Check test output for error messages
2. Verify mocks are set up correctly
3. Check that dependencies are installed
4. Clear test cache: `pnpm test --clearCache`

### Coverage Issues

1. Run coverage report: `pnpm test:coverage`
2. Check coverage report in `coverage/` directory
3. Add tests for uncovered code

### E2E Tests Failing

1. Ensure dev server is running
2. Check Playwright browser installation: `pnpm exec playwright install`
3. Check test timeout settings

## CI/CD Integration

Tests should run in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test

- name: Run E2E tests
  run: pnpm test:e2e
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

