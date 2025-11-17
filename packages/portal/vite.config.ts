import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portal',
      remotes: isDev
        ? {
            tradePlans: 'http://localhost:5001/remoteEntry.js',
            clientVerification: 'http://localhost:5002/remoteEntry.js',
            annuitySales: 'http://localhost:5003/remoteEntry.js',
          }
        : {},
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
      '@': path.resolve(__dirname, './src'),
      '@federation/shared': path.resolve(__dirname, '../shared/src'),
    }
  },
  build: {
    target: 'esnext',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
  },
  server: {
    port: 5173,
    strictPort: true
  }
})

