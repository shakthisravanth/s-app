import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute path for proper routing
  server: {
    host: '0.0.0.0', // Allow access from mobile devices on same network
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://incred-demo-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
