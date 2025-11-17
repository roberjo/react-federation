import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StoreProvider } from './contexts/StoreContext'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/toaster'
import { Toaster as Sonner } from './components/ui/sonner'
import { LoginCallback } from './components/Auth/LoginCallback'
import { UnauthorizedPage } from './components/Auth/UnauthorizedPage'
import { SecureRoute } from './components/Auth/SecureRoute'
import { Layout } from './components/Layout/Layout'
import { ModuleLoader } from './components/ModuleLoader'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RootStore from './stores/RootStore'
import { MODULE_ACCESS } from './config/oktaConfig'
import './App.css'

const queryClient = new QueryClient()

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/callback" element={<LoginCallback />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      <Route
        element={
          <SecureRoute>
            <Layout />
          </SecureRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        
        <Route
          path="/trade-plans/*"
          element={
            <SecureRoute requiredRoles={MODULE_ACCESS.tradePlans}>
              <ModuleLoader
                remoteName="tradePlans"
                module="./App"
                requiredRoles={MODULE_ACCESS.tradePlans}
              />
            </SecureRoute>
          }
        />

        <Route
          path="/client-verification/*"
          element={
            <SecureRoute requiredRoles={MODULE_ACCESS.clientVerification}>
              <ModuleLoader
                remoteName="clientVerification"
                module="./App"
                requiredRoles={MODULE_ACCESS.clientVerification}
              />
            </SecureRoute>
          }
        />

        <Route
          path="/annuity-sales/*"
          element={
            <SecureRoute requiredRoles={MODULE_ACCESS.annuitySales}>
              <ModuleLoader
                remoteName="annuitySales"
                module="./App"
                requiredRoles={MODULE_ACCESS.annuitySales}
              />
            </SecureRoute>
          }
        />
      </Route>

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <StoreProvider store={rootStore}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
