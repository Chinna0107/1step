import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth':      { target: backendUrl, changeOrigin: true },
        '/dashboard': { target: backendUrl, changeOrigin: true },
        '/customers': { target: backendUrl, changeOrigin: true },
        '/customer':  { target: backendUrl, changeOrigin: true },
        '/master':    { target: backendUrl, changeOrigin: true },
      },
    },
  }
})
