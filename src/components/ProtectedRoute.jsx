import React from 'react'
import { Navigate } from 'react-router-dom'

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
  const token = getToken(requiredRole)
  if (!token) {
    const loginPath = requiredRole === 'superadmin' ? '/login/superadmin' : '/login/employee'
    return <Navigate to={loginPath} replace />
  }
  return children
}

export function SuperAdminRoute({ children }) {
  return <ProtectedRoute requiredRole="superadmin">{children}</ProtectedRoute>
}

export function AdminRoute({ children }) {
  // superadmin token also grants admin access
  const token = getToken('admin') || getToken('superadmin')
  if (!token) return <Navigate to="/login/employee" replace />
  return children
}

export function EmployeeRoute({ children }) {
  const token = getToken('employee') || getToken('admin') || getToken('superadmin')
  if (!token) return <Navigate to="/login/employee" replace />
  return children
}

export function CustomerRoute({ children }) {
  try {
    const auth = localStorage.getItem('customer_auth')
    if (!auth || !JSON.parse(auth).token) return <Navigate to="/login/customer" replace />
  } catch { return <Navigate to="/login/customer" replace /> }
  return children
}
