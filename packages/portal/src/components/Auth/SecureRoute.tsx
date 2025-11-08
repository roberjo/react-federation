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

  const hasGroupAccess = requiredGroups.length === 0 || 
    (requireAll 
      ? requiredGroups.every(g => authStore.hasGroup(g))
      : authStore.hasAnyGroup(requiredGroups)
    )

  const hasRoleAccess = requiredRoles.length === 0 ||
    (requireAll
      ? requiredRoles.every(r => authStore.hasRole(r))
      : requiredRoles.some(r => authStore.hasRole(r))
    )

  if (!hasGroupAccess || !hasRoleAccess) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
})

