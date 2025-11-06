# ADR-0002: Token Sharing Strategy - Props Injection

## Status
Accepted

## Context
The portal application manages authentication state (tokens, user claims, groups) via Okta OAuth 2.0. Remote modules need access to this authentication state to:
1. Make authenticated API calls
2. Implement role-based access control within modules
3. Display user information
4. Handle logout functionality

We need a strategy to share authentication state between the portal (host) and remote modules.

## Decision
We will use **Props Injection** as the primary mechanism for sharing authentication state from the portal to remote modules.

The portal's `ModuleLoader` component will inject authentication state as props into remote modules when they are loaded.

## Implementation Details

### Portal Side (ModuleLoader)
- Extract authentication state from `AuthStore`
- Create `auth` prop object with:
  - `user`: User claims (JWT decoded)
  - `token`: Access token
  - `groups`: User's Okta groups
  - `isAuthenticated`: Authentication status
  - Helper methods: `hasGroup()`, `hasAnyGroup()`, `hasRole()`
- Inject `onLogout` callback
- Pass props to remote component via spread operator

### Remote Module Side
- Accept `AppProps` interface with optional `auth` prop
- Use auth state for API calls and authorization
- Pass auth down to child components via props or context
- Handle standalone mode (no auth prop) gracefully

## Code Example

### Portal (ModuleLoader)
```typescript
const injectedProps = {
  ...props,
  auth: {
    user: authStore.claims,
    token: authStore.accessToken,
    groups: authStore.groups,
    isAuthenticated: authStore.isAuthenticated,
    hasGroup: (group: string) => authStore.hasGroup(group),
    hasAnyGroup: (groups: string[]) => authStore.hasAnyGroup(groups),
    hasRole: (role: string) => authStore.hasRole(role),
  },
  onLogout: () => authStore.logout(),
}

<RemoteComponent {...injectedProps} />
```

### Remote Module
```typescript
interface AppProps {
  auth?: {
    user?: any
    token?: string | null
    groups?: string[]
    isAuthenticated?: boolean
    hasGroup?: (group: string) => boolean
    hasAnyGroup?: (groups: string[]) => boolean
    hasRole?: (role: string) => boolean
  }
  onLogout?: () => void
}

export default function App(props: AppProps = {}) {
  const { auth } = props
  // Use auth for API calls and authorization
}
```

## Consequences

### Positive
- ✅ **Type Safety**: TypeScript interfaces ensure type safety
- ✅ **Explicit Dependencies**: Clear contract between portal and remotes
- ✅ **Testability**: Easy to mock props in tests
- ✅ **No Global State**: Avoids global state pollution
- ✅ **React Patterns**: Uses standard React prop passing
- ✅ **Standalone Support**: Remotes can work without portal (for dev)

### Negative
- ⚠️ **Prop Drilling**: May need to pass props through multiple component layers
  - *Mitigation*: Use React Context for deep prop passing
- ⚠️ **Interface Coupling**: Remotes must match portal's auth interface
  - *Mitigation*: Use shared types package for interface definitions

### Risks
- **Interface Changes**: Changes to auth interface require remote updates
  - *Mitigation*: Version shared types package, use semantic versioning
- **Token Exposure**: Tokens passed as props (though necessary for API calls)
  - *Mitigation*: Tokens only passed to trusted remote modules, HTTPS only

## Alternatives Considered

### Alternative 1: Global Window Object
- **Pros**: Simple, no prop drilling
- **Cons**: 
  - No type safety
  - Global state pollution
  - Harder to test
  - Security concerns (exposed globally)
- **Decision**: Rejected - Lacks type safety and follows anti-patterns

### Alternative 2: Shared MobX Store Package
- **Pros**: 
  - Reactive state updates
  - Single source of truth
  - No prop drilling
- **Cons**: 
  - Requires shared package dependency
  - More complex setup
  - Tight coupling between portal and remotes
- **Decision**: Rejected - Too much coupling, harder to maintain

### Alternative 3: Event-Based Communication
- **Pros**: Loose coupling, event-driven
- **Cons**: 
  - No type safety
  - Harder to debug
  - Async nature adds complexity
- **Decision**: Rejected - Too complex for simple state sharing

### Alternative 4: Hybrid Approach (Props + Window Fallback)
- **Pros**: Flexibility, fallback option
- **Cons**: 
  - Two mechanisms to maintain
  - Confusion about which to use
  - More complex
- **Decision**: Rejected - Simplicity preferred, props injection sufficient

## Implementation Guidelines

1. **Shared Types**: Define `AppProps` interface in shared types package
2. **Default Values**: Remotes should handle missing auth gracefully
3. **Context Usage**: Use React Context within remotes to avoid prop drilling
4. **API Client**: Remote API clients should use injected token
5. **Authorization**: Use injected `hasGroup()` methods for RBAC

## Migration Path

For existing remotes:
1. Update `App` component to accept `AppProps`
2. Extract auth from props
3. Update API clients to use injected token
4. Update authorization checks to use injected methods
5. Test in both standalone and federated modes

## References
- [React Props Documentation](https://react.dev/learn/passing-props-to-a-component)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Module Federation State Sharing](https://module-federation.github.io/blog/en-US/2021/12/16/state-management)

## Date
2024

## Authors
Architecture Team

