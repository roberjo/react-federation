import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tradePlans',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        'react': { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'mobx': { singleton: true },
        // Don't share mobx-react-lite - let each remote bundle its own copy
        // This avoids issues where mobx-react-lite tries to access React before it's resolved
        // mobx-react-lite removed from shared - will be bundled in each remote
        'react-router-dom': { singleton: true }
      }
    })
  ],
  resolve: {
    alias: {
      '@federation/shared': path.resolve(__dirname, '../shared/src'),
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5001,
    cors: true,
    strictPort: true
  },
  preview: {
    port: 5001,
    cors: true,
    strictPort: true
  }
})

