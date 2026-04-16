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
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
}

export function EmployeeRoute({ children }) {
  return <ProtectedRoute requiredRole="employee">{children}</ProtectedRoute>
}
