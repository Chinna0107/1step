import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/dashboard': 'http://localhost:3000',
      '/customers': 'http://localhost:3000',
      '/master': 'http://localhost:3000',
    }
  }
})
