# Role-Based Authentication System

## Overview
The system now supports both Admin and Employee logins through a single Employee/Admin login page with role-based token management.

## Token Structure

### Admin Token
```json
{
  "token": "admin_token_xxxxx",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "admin"
  },
  "role": "admin",
  "tokenType": "admin_token",
  "timestamp": "2024-01-15T10:30:00Z"
}
```
Stored in: `localStorage.admin_auth`

### Employee Token
```json
{
  "token": "employee_token_xxxxx",
  "user": {
    "id": 2,
    "email": "employee@example.com",
    "name": "Employee Name",
    "role": "employee"
  },
  "role": "employee",
  "tokenType": "employee_token",
  "timestamp": "2024-01-15T10:30:00Z"
}
```
Stored in: `localStorage.employee_auth`

## Login Flow

1. User enters email and password on `/login/employee`
2. System verifies credentials
3. User enters 6-digit MPIN
4. System checks user role (admin or employee)
5. Token is saved with role-specific key
6. User is redirected to appropriate dashboard:
   - Admin → `/admin/dashboard`
   - Employee → `/employee/dashboard`

## Protected Routes

All admin and employee routes are protected using `ProtectedRoute` component:

```jsx
<Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
<Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
```

If user tries to access a route without valid token, they're redirected to login.

## Token Utilities

Use `tokenUtils.js` for token operations:

```javascript
import { getTokenByRole, getUserByRole, verifyToken, getAuthHeader } from './utils/tokenUtils'

// Get token for API calls
const adminToken = getTokenByRole('admin')

// Get user data
const user = getUserByRole('admin')

// Verify token validity
if (verifyToken('admin')) {
  // Token is valid
}

// Get auth header for API requests
const headers = getAuthHeader('admin')
// Returns: { Authorization: 'Bearer admin_token_xxxxx' }
```

## Logout

Logout clears role-specific token:

```javascript
const { logout } = useRoleBasedAuth()
logout('admin')  // Clears admin token
logout('employee')  // Clears employee token
```

## API Integration

When making API calls, include the role-specific token:

```javascript
const token = getTokenByRole('admin')
const response = await fetch('/api/admin/data', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Current Role

Get the currently logged-in user's role:

```javascript
const { getCurrentRole } = useRoleBasedAuth()
const role = getCurrentRole()  // 'admin' or 'employee'
```

## Files Modified/Created

- `src/hooks/useRoleBasedAuth.js` - Role-based auth hook
- `src/components/ProtectedRoute.jsx` - Protected route components
- `src/utils/tokenUtils.js` - Token utility functions
- `src/pages/LoginEmployee.jsx` - Updated to use role-based auth
- `src/components/admin/AdminSidebar.jsx` - Added logout with token clearing
- `src/components/employee/EmployeeNavbar.jsx` - Added logout with token clearing
- `src/AppRoutes.jsx` - Updated with protected routes
