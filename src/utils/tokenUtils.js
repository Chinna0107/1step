export function getTokenByRole(role) {
  const auth = localStorage.getItem(`${role}_auth`)
  return auth ? JSON.parse(auth).token : null
}

export function getUserByRole(role) {
  const auth = localStorage.getItem(`${role}_auth`)
  return auth ? JSON.parse(auth).user : null
}

export function verifyToken(role) {
  const auth = localStorage.getItem(`${role}_auth`)
  if (!auth) return false
  const { token, timestamp } = JSON.parse(auth)
  if (!token) return false
  const tokenAge = Date.now() - new Date(timestamp).getTime()
  const maxAge = 9 * 60 * 60 * 1000 // 9 hours — matches backend JWT expiry
  return tokenAge < maxAge
}

export function getAuthHeader(role) {
  const token = getTokenByRole(role)
  return token && token !== 'null' ? { Authorization: `Bearer ${token}` } : {}
}
