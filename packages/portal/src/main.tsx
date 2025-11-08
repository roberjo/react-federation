import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

