import config from '../config'

export const api = async (endpoint, options = {}) => {
  const { headers: extraHeaders, ...rest } = options

  const isFormData = rest.body instanceof FormData
  const headers = { ...extraHeaders }
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${config.API_URL}${endpoint}`, {
    ...rest,
    cache: 'no-store',
    headers,
  })

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Server error (${res.status}) — is the backend running?`)
  }

  const data = await res.json()

  // Auto-redirect on 401 — token expired or missing
  if (res.status === 401) {
    const isCustomer  = endpoint.startsWith('/customer') || window.location.pathname.startsWith('/customer')
    const isSuperAdmin = endpoint.startsWith('/auth/superadmin') || localStorage.getItem('current_role') === 'superadmin'
    if (isCustomer) {
      localStorage.removeItem('customer_auth')
      window.location.href = '/login/customer'
    } else if (isSuperAdmin) {
      localStorage.removeItem('superadmin_auth')
      window.location.href = '/login/superadmin'
    } else {
      localStorage.removeItem('employee_auth')
      localStorage.removeItem('admin_auth')
      window.location.href = '/login/employee'
    }
    throw new Error(data.error || 'Session expired. Please log in again.')
  }

  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
