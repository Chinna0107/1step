import { useState, useCallback } from 'react'
import config from '../config'

const TOKEN_KEY = 'ms_token'
const USER_KEY  = 'ms_user'

export function useAuth() {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)

  const saveSession = useCallback((token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token)
    setUser(user)
  }, [])

  const clearSession = useCallback(async () => {
    if (token) {
      try {
        await fetch(`${config.API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {}
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [token])

  return { user, token, saveSession, clearSession, isLoggedIn: !!token }
}
