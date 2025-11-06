import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { StoreProvider, useStores } from './contexts/StoreContext'
import { LoginPage } from './components/Auth/LoginPage'
import { LoginCallback } from './components/Auth/LoginCallback'
import { UnauthorizedPage } from './components/Auth/UnauthorizedPage'
import { SecureRoute } from './components/Auth/SecureRoute'
import { ModuleLoader } from './components/ModuleLoader'
import RootStore from './stores/RootStore'
import './App.css'

const AppRoutes = observer(() => {
  const { authStore } = useStores()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/callback" element={<LoginCallback />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      <Route
        path="/"
        element={
          <SecureRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p className="text-dark-600">
                Welcome, {authStore.claims?.name || 'User'}!
              </p>
              <p className="text-dark-600 mt-2">
                Groups: {authStore.groups.join(', ') || 'None'}
              </p>
            </div>
          </SecureRoute>
        }
      />

      <Route
        path="/trade-plans/*"
        element={
          <SecureRoute requiredGroups={['trade-planners', 'traders', 'admins']}>
            <ModuleLoader
              remoteName="tradePlans"
              module="./App"
              requiredGroups={['trade-planners', 'traders', 'admins']}
            />
          </SecureRoute>
        }
      />

      <Route
        path="/client-verification/*"
        element={
          <SecureRoute requiredGroups={['compliance-officers', 'kyc-specialists', 'admins']}>
            <ModuleLoader
              remoteName="clientVerification"
              module="./App"
              requiredGroups={['compliance-officers', 'kyc-specialists', 'admins']}
            />
          </SecureRoute>
        }
      />

      <Route
        path="/annuity-sales/*"
        element={
          <SecureRoute requiredGroups={['sales-agents', 'sales-managers', 'admins']}>
            <ModuleLoader
              remoteName="annuitySales"
              module="./App"
              requiredGroups={['sales-agents', 'sales-managers', 'admins']}
            />
          </SecureRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
})

function App() {
  const rootStore = new RootStore()

  useEffect(() => {
    rootStore.initialize()
  }, [])

  return (
    <StoreProvider store={rootStore}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App

