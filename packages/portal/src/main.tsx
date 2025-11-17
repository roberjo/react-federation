import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * Initialize federation shared scope with React/ReactDOM
 * This must be done before any remote modules are loaded
 */
function initializeFederationSharedScope() {
  if (!(window as any).__federation_shared__) {
    (window as any).__federation_shared__ = {}
  }
  
  const sharedScope = (window as any).__federation_shared__
  
  // Initialize default scope
  if (!sharedScope.default) {
    sharedScope.default = {}
  }
  
  // Expose React in shared scope for remote modules
  // The federation plugin calls: await (await versionValue.get())()
  // So get() must return a promise that resolves to a function that returns the module
  if (!sharedScope.default.react) {
    sharedScope.default.react = {
      '18.2.0': {
        get: () => Promise.resolve(() => Promise.resolve(React)),
        loaded: true,
        from: 'portal'
      }
    }
  }
  
  // Expose ReactDOM in shared scope for remote modules
  if (!sharedScope.default['react-dom']) {
    sharedScope.default['react-dom'] = {
      '18.2.0': {
        get: () => Promise.resolve(() => Promise.resolve(ReactDOM)),
        loaded: true,
        from: 'portal'
      }
    }
  }
}

// Initialize federation shared scope immediately
initializeFederationSharedScope()

// Initialize MSW in development
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false') {
    const { worker } = await import('./mocks/browser')
    // Worker is already started in browser.ts, just wait for it
    if (worker) {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
    }
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})

