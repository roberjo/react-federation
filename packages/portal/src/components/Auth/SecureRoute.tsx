import { observer } from 'mobx-react-lite'
import { Navigate } from 'react-router-dom'
import { useStores } from '../../contexts/StoreContext'

type SecurityList = ReadonlyArray<string>;

interface SecureRouteProps {
  children: React.ReactNode
  requiredGroups?: SecurityList
  requiredRoles?: SecurityList
  requireAll?: boolean
}

export const SecureRoute = observer(({ 
  children, 
  requiredGroups = [], 
  requiredRoles = [],
  requireAll = false 
}: SecureRouteProps) => {
  const { authStore } = useStores()

  if (authStore.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Primary RBAC: Check roles from JWT claims first
  if (requiredRoles.length > 0) {
    const hasRoleAccess = requireAll
      ? requiredRoles.every(r => authStore.hasRole(r))
      : authStore.hasAnyRole(requiredRoles)
    
    if (!hasRoleAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Fallback: Check groups if no roles specified (legacy support)
  if (requiredGroups.length > 0 && requiredRoles.length === 0) {
    const hasGroupAccess = requireAll
      ? requiredGroups.every(g => authStore.hasGroup(g))
      : authStore.hasAnyGroup(requiredGroups)
    
    if (!hasGroupAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
})

