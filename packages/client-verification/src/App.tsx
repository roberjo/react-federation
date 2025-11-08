import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { AppProps } from '@federation/shared/types'
import VerificationQueue from './components/VerificationQueue'

export default function App(props: AppProps = {}) {
  const { auth } = props
  const user = auth?.user
  const groups = auth?.groups ?? []

  return (
    <BrowserRouter>
      <div className="min-h-screen space-y-6 bg-dark-50 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Client Verification</h1>
          <p className="text-sm text-muted-foreground">
            Monitor the KYC queue, prioritize escalations, and track document status in real time.
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
          <Route path="/*" element={<VerificationQueue auth={auth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

