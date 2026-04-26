import React from 'react'
import { Navigate } from 'react-router-dom'
import { verifyToken } from '../utils/tokenUtils'

function getToken(role) {
  try {
    const auth = localStorage.getItem(`${role}_auth`)
    if (!auth) return null
    return JSON.parse(auth).token || null
  } catch {
    return null
  }
}

export function ProtectedRoute({ children, requiredRole }) {
  if (!verifyToken(requiredRole)) {
    const loginPath = requiredRole === 'superadmin' ? '/login/superadmin' : '/login/employee'
    return <Navigate to={loginPath} replace />
  }
  return children
}

export function SuperAdminRoute({ children }) {
  return <ProtectedRoute requiredRole="superadmin">{children}</ProtectedRoute>
}

export function AdminRoute({ children }) {
  const ok = verifyToken('admin') || verifyToken('superadmin')
  if (!ok) return <Navigate to="/login/employee" replace />
  return children
}

export function EmployeeRoute({ children }) {
  const ok = verifyToken('employee') || verifyToken('admin') || verifyToken('superadmin')
  if (!ok) return <Navigate to="/login/employee" replace />
  return children
}

export function CustomerRoute({ children }) {
  try {
    const auth = localStorage.getItem('customer_auth')
    if (!auth) return <Navigate to="/login/customer" replace />
    const parsed = JSON.parse(auth)
    if (!parsed.token) return <Navigate to="/login/customer" replace />
    if (parsed.timestamp) {
      const tokenAge = Date.now() - new Date(parsed.timestamp).getTime()
      const maxAge = 9 * 60 * 60 * 1000
      if (tokenAge >= maxAge) {
        localStorage.removeItem('customer_auth')
        return <Navigate to="/login/customer" replace />
      }
    }
  } catch { return <Navigate to="/login/customer" replace /> }
  return children
}
