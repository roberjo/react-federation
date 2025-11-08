import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'clientVerification',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        'react': { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'mobx': { singleton: true },
        'mobx-react-lite': { singleton: true },
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
    port: 5002,
    cors: true,
    strictPort: true
  }
})

