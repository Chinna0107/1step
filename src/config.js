// ── src/config.js ─────────────────────────────────────────────
// In dev: API_URL is empty so requests go through Vite proxy (relative URLs)
// In prod: API_URL is the full backend URL from .env.production

const API_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || '')
  : ''

const config = {
  API_URL,

  // App info
  APP_NAME:    '1 Step Finance Care',
  SUPPORT_WA:  'https://wa.me/919581611711',
  SUPPORT_TEL: 'tel:+919581611711',

  // Auth
  TOKEN_EXPIRY_MS: 9 * 60 * 60 * 1000, // 9 hours

  // Environment flags
  IS_DEV:  import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}

export default config
