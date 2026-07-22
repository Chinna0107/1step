import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:3000'

  // Customer page routes — must NOT be proxied to backend
  const customerPageRoutes = [
    '/customer/dashboard', '/customer/services', '/customer/transactions',
    '/customer/coins', '/customer/kyc', '/customer/offers',
    '/customer/notifications', '/customer/support', '/customer/security',
    '/customer/cibil-repairs'
  ]

  return {
    plugins: [react()],
    server: {
      historyApiFallback: true,
      proxy: {
        '/auth':      { target: backendUrl, changeOrigin: true },
        '/dashboard': {
          target: backendUrl,
          changeOrigin: true,
          bypass(req) {
            // Only bypass GET requests with no Authorization header (page navigations)
            if (req.method === 'GET' && !req.headers.authorization) {
              return '/index.html'
            }
          },
        },
        '/customers': { target: backendUrl, changeOrigin: true },
        '/customer': {
          target: backendUrl,
          changeOrigin: true,
          bypass(req) {
            // If it's a page navigation (no Authorization header), serve React app
            if (customerPageRoutes.includes(req.url) && !req.headers.authorization) {
              return '/index.html'
            }
          },
        },
        '/master':         { target: backendUrl, changeOrigin: true },
        '/leads':          { target: backendUrl, changeOrigin: true },
        '/fraud':          { target: backendUrl, changeOrigin: true },
        '/finance':        { target: backendUrl, changeOrigin: true },
        '/notifications':  { target: backendUrl, changeOrigin: true },
        '/visitors':       { target: backendUrl, changeOrigin: true },
        '/cibil-repairs':  { target: backendUrl, changeOrigin: true },
      },
    },
  }
})
