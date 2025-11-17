import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import type { AppProps } from '@federation/shared/types'
import TradePlanList from './components/TradePlanList'
import TradePlanForm from './components/TradePlanForm'
import TradePlanDetail from './components/TradePlanDetail'
import TradePlanStore from './stores/TradePlanStore'

/**
 * Main App component for Trade Plans module
 * Receives authentication state via props injection from portal
 */
export default function App(props: AppProps = {}) {
  const { auth } = props

  // In standalone mode, auth might not be provided
  // In federated mode, portal provides auth via props with JWT claims including roles
  const user = auth?.user
  const roles = auth?.roles || [] // Roles from JWT claims (primary RBAC)

  // Create store instance (memoized to avoid recreating on each render)
  const store = useMemo(
    () =>
      new TradePlanStore(
        import.meta.env.VITE_API_BASE_URL || '/api',
        auth?.token || undefined
      ),
    [] // Only create once
  )

  // Update auth token when it changes
  useEffect(() => {
    if (auth?.token) {
      store.setAuthToken(auth.token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]) // Only depend on auth.token, not store (store is stable)

  return (
    <BrowserRouter>
      <div className="trade-plans-app p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark-900">Dollar Cost Averaging Plans</h1>
          {user && (
            <p className="text-dark-600 mt-2">
              Welcome, {user.name} ({user.email})
            </p>
          )}
          {roles.length > 0 && (
            <p className="text-sm text-dark-500 mt-1">
              Roles: {roles.join(', ')} {/* Roles from JWT claims */}
            </p>
          )}
        </div>

        <Routes>
          <Route 
            index
            element={<TradePlanList auth={auth} store={store} />} 
          />
          <Route 
            path="create" 
            element={
              // Use roles from JWT claims for RBAC authorization
              auth?.hasRole?.('trader') || auth?.hasRole?.('admin')
                ? <TradePlanForm auth={auth} store={store} />
                : <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-danger-700">Unauthorized: Trader or Admin role required</p>
                  </div>
            } 
          />
          <Route 
            path=":id" 
            element={<TradePlanDetail auth={auth} store={store} />} 
          />
          <Route 
            path=":id/edit" 
            element={
              // Use roles from JWT claims for RBAC authorization
              auth?.hasRole?.('trader') || auth?.hasRole?.('admin')
                ? <TradePlanForm auth={auth} store={store} />
                : <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-danger-700">Unauthorized: Trader or Admin role required</p>
                  </div>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

