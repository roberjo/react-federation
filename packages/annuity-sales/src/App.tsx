import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { AppProps } from '@federation/shared/types'
import SalesPipeline from './components/SalesPipeline'

export default function App(props: AppProps = {}) {
  const { auth } = props
  const user = auth?.user
  const groups = auth?.groups ?? []

  return (
    <BrowserRouter>
      <div className="min-h-screen space-y-6 bg-dark-50 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Annuity Sales</h1>
          <p className="text-sm text-muted-foreground">
            Manage the annuity sales pipeline, forecast premium production, and track owner performance.
          </p>

          {(user || groups.length > 0) && (
            <div className="rounded-md border border-border bg-white/60 p-3 text-sm text-muted-foreground shadow-sm">
              {user && (
                <div>
                  Logged in as <span className="font-medium text-foreground">{user.name}</span>
                  {user.email ? <span> ({user.email})</span> : null}
                </div>
              )}
              {groups.length > 0 && (
                <div>
                  Effective Groups:{' '}
                  <span className="font-medium text-foreground">{groups.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </header>

        <Routes>
          <Route path="/*" element={<SalesPipeline auth={auth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

