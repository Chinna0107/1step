import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:3000'
  // React page prefixes — GET requests to these must serve index.html
  const reactPagePrefixes = [
    '/superadmin/', '/admin/', '/employee/', '/customer/',
    '/login/', '/about', '/what-we-do', '/careers', '/contact',
    '/gallery', '/faq', '/terms', '/privacy', '/product/'
  ]

  // API-only prefixes — always proxy regardless of method
  const apiOnlyPrefixes = [
    '/auth/', '/customers/', '/master/', '/leads/', '/fraud/',
    '/finance/', '/notifications/', '/visitors/', '/cibil-repairs/',
    '/gallery/', '/careers/', '/dashboard/'
  ]

  const bypass = (req) => {
    // Always proxy non-GET (POST/PATCH/DELETE) — API calls
    if (req.method !== 'GET') return null
    // Always proxy if Authorization header present — authenticated API call
    if (req.headers.authorization) return null
    // Serve React app for page navigations (browser requests without auth)
    const path = req.url.split('?')[0]
    const isReactPage = reactPagePrefixes.some(p => path.startsWith(p) || path === p.replace(/\/$/, ''))
    if (isReactPage) return '/index.html'
    return null
  }

  return {
    plugins: [
      react(),
      ViteImageOptimizer({
        png:  { quality: 70 },
        jpeg: { quality: 70 },
        jpg:  { quality: 70 },
        webp: { lossless: false, quality: 70 },
      }),
      // Make non-critical CSS (PDF viewer) load asynchronously to unblock render
      {
        name: 'async-non-critical-css',
        apply: 'build',
        transformIndexHtml(html) {
          // Convert vendor-pdf CSS to async load using print media trick
          return html.replace(
            /(<link[^>]*vendor-pdf[^>]*\.css[^>]*)(\s*\/>|>)/g,
            (match, before) => {
              const href = match.match(/href="([^"]+)"/)?.[1] || ''
              return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
            }
          )
        },
      },
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react-pdf') || id.includes('node_modules/jspdf') || id.includes('node_modules/pdfjs')) return 'vendor-pdf'
            if (id.includes('node_modules/xlsx')) return 'vendor-xlsx'
            if (id.includes('node_modules/gsap')) return 'vendor-gsap'
            if (id.includes('node_modules/react-icons')) return 'vendor-icons'
            if (id.includes('node_modules/react-router') || id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react'
          },
        },
      },
    },
    server: {
      proxy: {
        '/auth':         { target: backendUrl, changeOrigin: true },
        '/customers':    { target: backendUrl, changeOrigin: true },
        '/master':       { target: backendUrl, changeOrigin: true },
        '/leads':        { target: backendUrl, changeOrigin: true },
        '/fraud':        { target: backendUrl, changeOrigin: true },
        '/finance':      { target: backendUrl, changeOrigin: true },
        '/notifications':{ target: backendUrl, changeOrigin: true },
        '/visitors':     { target: backendUrl, changeOrigin: true },
        '/cibil-repairs':{ target: backendUrl, changeOrigin: true },
        '/careers':      { target: backendUrl, changeOrigin: true },
        '/gallery':      { target: backendUrl, changeOrigin: true, bypass: (req) => {
          // /gallery exact path: proxy if has auth header or non-GET, else serve React page
          if (req.method !== 'GET') return null
          if (req.headers.authorization) return null
          const path = req.url.split('?')[0]
          if (path === '/gallery') return '/index.html'
          return null
        } },
        '/dashboard':    { target: backendUrl, changeOrigin: true, bypass },
        '/superadmin':   { target: backendUrl, changeOrigin: true, bypass },
        '/admin':        { target: backendUrl, changeOrigin: true, bypass },
        '/employee':     { target: backendUrl, changeOrigin: true, bypass },
        '/customer':     { target: backendUrl, changeOrigin: true, bypass },
      },
    },
  }
})
