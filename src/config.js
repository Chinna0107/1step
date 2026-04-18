// ── src/config.js ─────────────────────────────────────────────
// Single source of truth for environment-dependent config.
// Vite replaces import.meta.env.* at build time.
// Dev  → reads from .env
// Prod → reads from .env.production

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const config = {
  API_URL,

  // App info
  APP_NAME:    'MoneySpot',
  SUPPORT_WA:  'https://wa.me/919866440477',
  SUPPORT_TEL: 'tel:+919866440477',

  // Auth
  TOKEN_EXPIRY_MS: 9 * 60 * 60 * 1000, // 9 hours

  // Environment flags
  IS_DEV:  import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}

export default config
