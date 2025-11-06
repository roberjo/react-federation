import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { AppProps } from '@federation/shared/types'
import TradeList from './components/TradeList'

/**
 * Main App component for Trade Plans module
 * Receives authentication state via props injection from portal
 */
export default function App(props: AppProps = {}) {
  const { auth } = props

  // In standalone mode, auth might not be provided
  // In federated mode, portal provides auth via props
  const isAuthenticated = auth?.isAuthenticated ?? true
  const user = auth?.user
  const groups = auth?.groups || []

  return (
    <BrowserRouter>
      <div className="trade-plans-app p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark-900">Trade Plans</h1>
          {user && (
            <p className="text-dark-600 mt-2">
              Welcome, {user.name} ({user.email})
            </p>
          )}
          {groups.length > 0 && (
            <p className="text-sm text-dark-500 mt-1">
              Groups: {groups.join(', ')}
            </p>
          )}
        </div>

        <Routes>
          <Route 
            path="/" 
            element={<TradeList auth={auth} />} 
          />
          <Route 
            path="/create" 
            element={
              auth?.hasGroup?.('traders') || auth?.hasGroup?.('admins') 
                ? <div className="p-6 bg-white rounded-lg shadow-card">
                    <h2 className="text-xl font-semibold mb-4">Create Trade</h2>
                    <p className="text-dark-600">Trade creation form coming soon...</p>
                  </div>
                : <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-danger-700">Unauthorized: Traders or Admins only</p>
                  </div>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              auth?.hasGroup?.('admins')
                ? <div className="p-6 bg-white rounded-lg shadow-card">
                    <h2 className="text-xl font-semibold mb-4">Trade Analytics</h2>
                    <p className="text-dark-600">Analytics dashboard coming soon...</p>
                  </div>
                : <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-danger-700">Unauthorized: Admins only</p>
                  </div>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

