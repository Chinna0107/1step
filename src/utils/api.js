export const api = async (endpoint, options = {}) => {
  const { headers: extraHeaders, ...rest } = options
  const base = import.meta.env.VITE_API_URL || ''

  const res = await fetch(`${base}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Server error (${res.status}) — is the backend running on port 3000?`)
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
