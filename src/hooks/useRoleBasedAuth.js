import { useState } from 'react'

export function useRoleBasedAuth() {
  const [authData, setAuthData] = useState(null)

  const saveAuthData = (token, user, role) => {
    const authPayload = {
      token,
      user,
      role,
      tokenType: `${role}_token`,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(`${role}_auth`, JSON.stringify(authPayload))
    localStorage.setItem('current_role', role)
    setAuthData(authPayload)
  }

  const getAuthData = (role) => {
    const stored = localStorage.getItem(`${role}_auth`)
    return stored ? JSON.parse(stored) : null
  }

  const getCurrentRole = () => {
    return localStorage.getItem('current_role')
  }

  const isAuthenticated = (role) => {
    const auth = getAuthData(role)
    return auth && auth.token ? true : false
  }

  const logout = (role) => {
    localStorage.clear()
    setAuthData(null)
  }

  const logoutAll = () => {
    localStorage.clear()
    setAuthData(null)
  }

  return {
    authData,
    saveAuthData,
    getAuthData,
    getCurrentRole,
    isAuthenticated,
    logout,
    logoutAll,
  }
}
