import { observer } from 'mobx-react-lite';
import { Navigate } from 'react-router-dom';
import { useStores } from '../../hooks/useStores';
import { Loader2 } from 'lucide-react';

interface SecureRouteProps {
  children: React.ReactNode;
  requiredGroups?: string[];
  requiredRoles?: string[];
  requireAll?: boolean;
}

export const SecureRoute = observer(({ 
  children, 
  requiredGroups = [], 
  requiredRoles = [],
  requireAll = false 
}: SecureRouteProps) => {
  const { authStore } = useStores();

  if (authStore.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasGroupAccess = requiredGroups.length === 0 || 
    (requireAll 
      ? requiredGroups.every(g => authStore.hasGroup(g))
      : authStore.hasAnyGroup(requiredGroups)
    );

  const hasRoleAccess = requiredRoles.length === 0 ||
    (requireAll
      ? requiredRoles.every(r => authStore.hasRole(r))
      : requiredRoles.some(r => authStore.hasRole(r))
    );

  if (!hasGroupAccess || !hasRoleAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
});
